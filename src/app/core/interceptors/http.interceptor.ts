import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";

import { LocalStorageService } from "../../../../../call-center/src/app/shared/services/local-storage.service";

export const HttpInterceptor: HttpInterceptorFn = (req, next) => {
  const localStorageService = inject(LocalStorageService)
  const accessToken = localStorageService.getItem('accessToken')
  const tokenType = localStorageService.getItem('tokenType')

  if(accessToken) {
    req = req.clone({
      setHeaders: {
        Authorization: `${tokenType} ${accessToken}`,
        'x-realm': 'apex-ldap',
        'Content-Type': 'application/json',
        'withCredentials': 'true',
      }
    })
  } else {
    req = req.clone({
      setHeaders: {
        'x-realm': 'apex-ldap',
        'withCredentials': 'true',
      }
    })
  }

  return next(req)
}
