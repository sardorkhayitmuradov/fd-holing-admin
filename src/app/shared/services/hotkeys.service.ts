import { DOCUMENT } from "@angular/common";
import { inject, Injectable } from "@angular/core";

import { filter, fromEvent, Observable, Subject, switchMap } from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class HotkeysService {
  public readonly hotkeysFree$ = new Subject<string>()
  private readonly hotkeysMap = new Map<string, Observable<KeyboardEvent>>()
  private readonly document = inject(DOCUMENT)
  private readonly keyDownEvent = fromEvent<KeyboardEvent>(this.document, 'keydown')

  public getHotkey(code: string): Observable<KeyboardEvent> | null {
    if(!this.hotkeysMap.has(code)) {
      const event = this.keyDownEvent.pipe(filter((event) => event.code === code))

      this.hotkeysMap.set(code, event)

      return event
    }

    return null
  }

  public getHotkeyWhenFree(code: string): Observable<KeyboardEvent> {
    return this.hotkeysFree$.pipe(
      filter((freeKey) => freeKey === code && !this.hotkeysMap.has(code)),
      switchMap(() => this.getHotkey(code) as Observable<KeyboardEvent>),
    )
  }

  public removeHotkey(key: string): void {
    this.hotkeysMap.delete(key)
    this.hotkeysFree$.next(key)
  }
}
