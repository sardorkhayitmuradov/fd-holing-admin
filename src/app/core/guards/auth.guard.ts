import { inject } from "@angular/core";
import { Router } from "@angular/router";

import { from, map, Observable, of, switchMap } from "rxjs";

import { AuthService } from "@core/services/requests/auth.service";

import { guardFactory } from "./factory.guard";

export const isAuthorized = guardFactory(
  (): Observable<boolean> => {
    const authState = inject(AuthService);
    const router = inject(Router)

    return authState.checkAuthenticated().pipe(
      switchMap(authorized => {
        if(!authorized) {
          return from(router.navigate(["/auth/login"])).pipe(map(() => true))
        } else {
          return  of(true)
        }
      })
    )
  }
)

export const isAnonymous = guardFactory(
  (): Observable<boolean> => {
    const authState = inject(AuthService);
    const router = inject(Router)

    return authState.checkAuthenticated().pipe(
      switchMap(authorized => {
        if(authorized) {
          return from(router.navigate(["/admin/documents"])).pipe(map(() => true))
        } else {
          return of(true)
        }
      })
    )
  }
)
