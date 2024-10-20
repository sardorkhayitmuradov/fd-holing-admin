import { isDevMode } from "@angular/core";
import { CanMatchFn } from "@angular/router";

import { of } from "rxjs";

export function guardFactory(guard: CanMatchFn): CanMatchFn {
  // TODO remove this in production
  if(isDevMode() && document && document.location && document.location.href.includes('disableGuards')) {
    // eslint-disable-next-line no-console
    console.log(`%c${ document.location.href } is not performed`, "color:green")

    return () => of(true)
  }

  return guard
}
