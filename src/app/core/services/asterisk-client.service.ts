import { DOCUMENT } from "@angular/common";
import { inject, Injectable } from "@angular/core";

import { reactiveCache } from "@reactive-cache/core";
import * as JsSIP from "jssip";
import { RTCSession } from "jssip/lib/RTCSession";
import { IncomingRTCSessionEvent, UAConfiguration } from "jssip/lib/UA";
import { NzMessageService } from "ng-zorro-antd/message";
import { NzModalService } from "ng-zorro-antd/modal";

import { ASTERISK_CALLERS_MOCK } from "@app/core/constants/asterisk-callers.mock";
import { LocalStorageService } from "@shared/services/local-storage.service";
import { ENV } from "environments";

@Injectable({
  providedIn: 'root',
})
export class AsteriskClientService {
  public connectionStatus$ = reactiveCache<'success' | 'fail' | 'pending'>('fail', { name: 'asteriskConnectionStatus' });
  public ua: JsSIP.UA | null = null
  public readonly pendingCalls$ = reactiveCache<IncomingRTCSessionEvent[]>([], { name: 'pendingCalls$', valueReachable: true })
  public readonly activeCall$ = reactiveCache<IncomingRTCSessionEvent | null>(
    ENV.IS_DEV ? ASTERISK_CALLERS_MOCK[0] : null,
    { name: 'activeCalls$', valueReachable: true }
  );

  public readonly operatorStatus$ = reactiveCache<'online' | 'offline'>('offline', { name: 'operatorStatus', valueReachable: true });
  public readonly authData$ = reactiveCache<{ uri: string } | null>(null, { name: 'asteriskAuthData', valueReachable: true })

  private readonly pendingCallsSnapshot: IncomingRTCSessionEvent[] = [];
  private readonly socket = new JsSIP.WebSocketInterface(`wss://${ ENV.ASTERISK_WS_HOST }:${ ENV.ASTERISK_WS_PORT }/ws`);
  private readonly localStorage = inject(LocalStorageService);
  private readonly messageService = inject(NzMessageService);
  private readonly modalService = inject(NzModalService);

  private readonly outCallConfiguration = {
    mediaConstraints: { audio: true, video: false },
    rtcOfferConstraints: {
      offerToReceiveAudio: true,
      offerToReceiveVideo: false,
    },
    sessionTimersExpires: 120,
  }

  private readonly document = inject(DOCUMENT);
  private mediaStream: MediaStream | undefined
  private remoteAudio = new Audio();

  public get isConnected(): boolean {
    return this.ua?.isConnected() ?? false;
  }

  public init(newConfig ?: { uri: string, password: string }): this {
    this.disconnect()
    this.connectionStatus$.next('pending')

    const defaultConfiguration = {
      sockets  : [ this.socket ],
      uri      : this.localStorage.getItem('asteriskUsername') + '@' + ENV.ASTERISK_WS_HOST,
      password : this.localStorage.getItem('asteriskPassword') ?? '',
    }

    const config: UAConfiguration = newConfig ? { ...defaultConfiguration, ...{ uri: newConfig.uri + '@' + ENV.ASTERISK_WS_HOST, password: newConfig.password } } : defaultConfiguration

    try {
      if(!config.password || !config.uri) {
        throw new Error('Password and URI are required')
      }

      this.ua = new JsSIP.UA(config)
      if(ENV.IS_DEV) {
        // JsSIP.debug.enable('JsSIP:*');
        JsSIP.debug.disable();
      } else {
        JsSIP.debug.disable();
      }

      // События регистрации клиента
      this.ua.on('connected', (e) => {
        console.log("connected", e)
      });
      this.ua.on('disconnected', (e) => {
        console.log("disconnected", e)
        this.connectionStatus$.next('fail')
      });

      this.ua.on('registered', (e) => {
        console.log("registered", e)
        this.connectionStatus$.next('success')
        this.goOnline()
      });
      this.ua.on('unregistered', (e) => { console.log("unregistered", e) })
      this.ua.on('registrationFailed', (e) => {
        console.log("registrationFailed", e)
        this.connectionStatus$.next('fail')
      });

      // Запускаем
      this.ua.start();
      this.initSessionEvents();
      this.remoteAudio.autoplay = true;
      this.operatorStatus$.next('online');

      if(this.document.defaultView) {
        this.document.defaultView.navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then((stream) => {
          this.mediaStream = stream;
        }).catch((e) => {
          this.document.defaultView?.alert?.('Не удалось подключить звук, включите его в настройках браузера');
        })
      }
    } catch(e) {
      console.warn('Failed to initialize JsSIP', e)
      this.connectionStatus$.next('fail');
    }

    return this
  }

  public removePendingCall(session: IncomingRTCSessionEvent): void {
    const index = this.pendingCallsSnapshot.indexOf(session);

    if (index > -1) {
      this.pendingCallsSnapshot.splice(index, 1);
    }

    this.pendingCalls$.next(this.pendingCallsSnapshot);
  }

  public hangupCall(sessionEvent: IncomingRTCSessionEvent): void {
    const index = this.pendingCallsSnapshot.indexOf(sessionEvent);

    if (index > -1) {
      this.pendingCallsSnapshot[index].session.terminate();
      this.removePendingCall(sessionEvent);
    }

    if(this.activeCall$.getValue() === sessionEvent) {
      this.activeCall$.getValue()?.session.terminate();
      this.activeCall$.next(null);
    }
  }

  public hangUpActiveCall(): void {
    const activeCall = this.activeCall$.getValue();

    if (activeCall) {
      this.hangupCall(activeCall);
    }
  }

  public answerCall(sessionEvent: IncomingRTCSessionEvent): void {
    if(this.activeCall$.getValue()) {
      this.messageService.error('Нельзя совершить звонок, пока есть активный звонок', { nzDuration: 10_000 });
      throw new Error('Active call is present');
    }

    this.activeCall$.next(sessionEvent);
    sessionEvent.session.answer({
      mediaConstraints: {
        audio: true,
        video: false // Set to true if you want to answer with video
      },
      mediaStream: this.mediaStream
    });
  }

  public callByNumber(number: string): RTCSession {
    if(!this.ua) {
      this.messageService.error('Asterisk не инициализирован', { nzDuration: 10_000 })
      throw new Error('UA is not initialized, call init() first');
    }

    if(this.activeCall$.getValue()) {
      this.messageService.error('Нельзя совершить звонок, пока есть активный звонок', { nzDuration: 10_000 });
      throw new Error('Active call is present');
    }

    const session = this.ua.call(`sip:${ number }@${ ENV.ASTERISK_WS_HOST }`, {
      ...this.outCallConfiguration,
      mediaStream: this.mediaStream
    });

    session.on('progress', () => {
      const tracks = session
        .connection
        .getReceivers()
        .map((sender: RTCRtpReceiver) => sender.track)
        .filter((track: MediaStreamTrack) => !!track && track.kind === 'audio')

      this.remoteAudio.srcObject = new MediaStream(tracks)
      void this.remoteAudio.play();
    });

    session.on('ended', () => {
      this.activeCall$.next(null)
    });

    session.on('failed', (e) => {
      this.document.defaultView?.alert('Не удалось позвонить: ' + e.cause);
      this.activeCall$.next(null)
    });
    //
    // session.on('progress', () => {
    //   console.log('Call in progress');
    // })

    this.initAudio(session);

    return session;
  }

  public goOffline(): void {
    if(this.activeCall$.getValue()) {
      this.messageService.error('Нельзя перейти в оффлайн, пока есть активный звонок', { nzDuration: 10_000 });

      return ;
    }

    this.callByNumber(ENV.SIP_GO_OFFLINE_NUMBER);
    this.operatorStatus$.next('offline');
  }

  public goOnline(): void {
    this.callByNumber(ENV.SIP_GO_ONLINE_NUMBER);
    this.operatorStatus$.next('online');
  }

  public disconnect(): void {
    this.ua?.unregister({ all: true })
    this.ua?.terminateSessions()
    this.ua?.stop()
  }

  public redirectCall(number: string, isInternalNumber: boolean): void {
    const activeSession = this.activeCall$.getValue()?.session

    if(activeSession) {
      const editedNumber = isInternalNumber ? `sip:${ number }@${ ENV.ASTERISK_WS_HOST }` : number;

      activeSession.on('refer', (e) => {
        const referToHeader = e.request.parseHeader('refer-to')

        if(referToHeader && typeof referToHeader === 'object' && 'uri' in referToHeader) {
          if (
            typeof referToHeader['uri'] === 'object' &&
            referToHeader.uri &&
            'toAor' in referToHeader.uri &&
            typeof referToHeader.uri.toAor === 'function'
          ) {
            this.modalService.info({
              nzTitle: 'Переадресация',
              nzContent: `Звонок переадресован на ${referToHeader.uri.toAor()}`,
            })
          }
        }

        activeSession.terminate();
      });

      activeSession.refer(editedNumber, {
        extraHeaders: [],
      });
    }
  }

  public isActiveCall(session: IncomingRTCSessionEvent): boolean {
    return !!this.activeCall$.getValue()?.session.id &&
      !!session.session.id &&
      this.activeCall$.getValue()?.session.id === session.session.id;
  }

  private initSessionEvents(): void {
    this.ua?.on?.('newRTCSession', (data: IncomingRTCSessionEvent) => {
      const session = data.session;

      session.on('sdp', (e) => {
        console.log('SDP:', e);
      });

      // Add to pending calls if it's incoming and pending
      if (session.direction === 'incoming' && session.status === 4) {
        this.addPendingCall(data);
      }

      session.on('progress', () => {
        if(data.session.direction === 'outgoing') {
          if(data.request.to.uri.user != ENV.SIP_GO_OFFLINE_NUMBER && data.request.to.uri.user != ENV.SIP_GO_ONLINE_NUMBER) {
            this.activeCall$.next(data);
          }
        }
      })

      session.on('accepted', () => {
        this.removePendingCall(data);
        if(data.request.to.uri.user != ENV.SIP_GO_OFFLINE_NUMBER && data.request.to.uri.user != ENV.SIP_GO_ONLINE_NUMBER) {
          this.activeCall$.next(data);
        }
      });
      session.on('failed', () => {
        this.removePendingCall(data);
        if(data === this.activeCall$.getValue()) {
          this.activeCall$.next(null);
        }
      });

      session.on('ended', () => {
        this.removePendingCall(data);
        this.activeCall$.next(null);
      });

      this.initAudio(session);
    });
  }

  private addPendingCall(session: IncomingRTCSessionEvent): void {
    this.pendingCallsSnapshot.push(session);
    this.pendingCalls$.next(this.pendingCallsSnapshot);
  }

  private initAudio(session: RTCSession): void {
    session.on('peerconnection', (data) => {
      const pc = data.peerconnection;

      pc.addEventListener('track', (event) => {
        const remoteStream = event.streams[0];

        if (this.remoteAudio.srcObject !== remoteStream) {
          this.remoteAudio.srcObject = remoteStream;
          this.remoteAudio.play().catch((error) => {
            console.error('Error playing remote audio:', error);
          });
        }
      });
    });
  }
}
