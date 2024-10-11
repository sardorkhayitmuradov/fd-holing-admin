import { Injectable } from "@angular/core";

import { Howl } from "howler";

import { ENV } from "environments";

@Injectable({
  providedIn: 'root'
})
export class CallMelodyService {
  private melody: Howl | undefined

  public play(src: string): void {
    if(!ENV.PLAY_CALL_MUSIC) {
      return
    }

    this.melody = new Howl({ src })
    this.melody.play()
  }

  public stop(): void {
    this.melody?.stop()
    this.melody = undefined
  }
}
