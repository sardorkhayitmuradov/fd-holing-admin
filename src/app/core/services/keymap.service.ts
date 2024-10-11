import { DOCUMENT } from "@angular/common";
import { inject, Injectable } from "@angular/core";

import { NzModalService } from "ng-zorro-antd/modal";
import { fromEvent, Subscription } from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class KeymapService {
  private readonly document = inject(DOCUMENT)
  private readonly modalService = inject(NzModalService)

  private subscriptions: (Subscription | undefined)[] = []

  public initKeymaps(): this {
    this.dispose()
    this.subscriptions = [
      fromEvent<KeyboardEvent>(this.document, 'keydown')
        .subscribe((e: KeyboardEvent) => {
          if (e.code == "F5" || e.ctrlKey && e.code == 'KeyR') {
            e.preventDefault()
            e.stopImmediatePropagation()

            this.modalService.confirm({
              nzTitle: 'Вы уверены, что хотите перезагрузить страницу? \n Все несохраненные данные будут утеряны.',
              nzOnOk: () => {
                this.document.location.reload()
              },
            })
          }
        }),
    ]

    return this
  }

  public dispose(): void {
    this.subscriptions.forEach(sub => sub?.unsubscribe())
  }

}
