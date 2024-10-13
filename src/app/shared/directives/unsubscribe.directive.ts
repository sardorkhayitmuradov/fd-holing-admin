import { Directive, OnDestroy } from "@angular/core";

import { Subscription } from "rxjs";

@Directive()
export abstract class UnsubscribeDirective implements OnDestroy {
  private __subscriptionsList: Subscription[] = [];

  public set subscribeTo(sub: Subscription) {
    this.__subscriptionsList.push(sub);
  }

  public unsubscribeFromAll(): void {
    this.__subscriptionsList.forEach((sub: Subscription) => sub.unsubscribe());
  }

  public ngOnDestroy(): void {
    this.unsubscribeFromAll();
  }
}
