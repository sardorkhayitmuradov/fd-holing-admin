import { DOCUMENT } from "@angular/common";
import { Directive, effect, ElementRef, inject, input, OnDestroy, OnInit } from "@angular/core";

import { filter, Subscription } from "rxjs";

import { HotkeysService } from "@shared/services/hotkeys.service";

@Directive({
  selector: '[hotkey]',
  standalone: true,
})
export class HotkeyDirective implements OnInit, OnDestroy {
  public readonly hotkey = input<string>('')
  public readonly hotkeyDisabled = input<boolean>(false)
  public readonly hotkeyCtrl = input<boolean>(false)
  private readonly document = inject(DOCUMENT)
  private readonly hotkeysService = inject(HotkeysService)
  private readonly descriptionElement = this.document.createElement('span')
  private hotkeyIsFree = true
  private subscription: Subscription | undefined

  public constructor(private readonly elementRef: ElementRef<HTMLElement>) {

    effect(() => {
      if(this.hotkeyIsFree && !this.hotkeyDisabled()) {
        this.descriptionElement.style.display = 'block'
      } else {
        this.descriptionElement.style.display = 'none'
      }
    });
  }

  public ngOnInit(): void {
    this.descriptionElement.innerText = `[` + (this.hotkeyCtrl() ? 'Ctrl + ' : '') + this.hotkey().replace('Key', '') + `]`
    this.elementRef.nativeElement.appendChild(this.descriptionElement)
    this.descriptionElement.style.cssText = `
      position: absolute;
      padding: 0 10px;
      border-radius: 20px;
      font-size: 10px;
      left: 0;
      width: 100%;
      text-align: right;
      top: 0;
    `

    const obsOrNull = this.hotkeysService.getHotkey(this.hotkey())

    if(obsOrNull) {
      this.subscription = obsOrNull.pipe(
        filter(e => this.hotkeyCtrl() ? e.ctrlKey : true)
      ).subscribe(() => {
        if (!this.hotkeyDisabled()) {
          this.elementRef.nativeElement.click()
        }
      })
    } else {
      this.hotkeyIsFree = false
      this.descriptionElement.style.display = 'none'
      this.subscription = this.hotkeysService.getHotkeyWhenFree(this.hotkey()).pipe(
        filter(e => this.hotkeyCtrl() ? e.ctrlKey : true),
      ).subscribe((e) => {
        e.preventDefault()
        e.stopImmediatePropagation()
        this.hotkeyIsFree = true
        if (!this.hotkeyDisabled()) {
          this.elementRef.nativeElement.click()
        }
      })
    }
  }

  public ngOnDestroy(): void {
    this.subscription?.unsubscribe()
    this.hotkeysService.removeHotkey(this.hotkey())
  }
}
