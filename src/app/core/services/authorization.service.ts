import { inject, Injectable } from "@angular/core";

import { reactiveCache, ReactiveCacheObservable } from "@reactive-cache/core";
import { jwtDecode } from "jwt-decode";
import { catchError, map, Observable, of, tap } from "rxjs";

import { IDecodedToken } from "@app/core/types/decoded-token.type";
import { ILoginResponseData } from "@app/core/types/login-response.type";
import { ApiHttpClientService } from "@shared/services/api-http-client.service";
import { LocalStorageService } from "@shared/services/local-storage.service";

export interface LoginDto {
  username: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthorizationService {
  public readonly loginData: Observable<ILoginResponseData | null> = reactiveCache<ILoginResponseData | null>(this.updateToken.bind(this), {
    name: 'loginData',
  })

  public readonly decodedToken = reactiveCache<IDecodedToken | null>(
    this.loginData.pipe(map(data => data ? jwtDecode<IDecodedToken>(data.token) : null)),
    { name: 'decodedToken', valueReachable: true }
  )

  public readonly isAuthorized: Observable<boolean> = this.loginData.pipe(map(data => !!data))
  public readonly isSoftCollector: Observable<boolean> = of(true);

  private readonly localStorageService = inject(LocalStorageService);

  private readonly mobapiHttp = inject(ApiHttpClientService);
  private readonly loginType = 'LDAP';

  public login(dto: LoginDto): Observable<void> {
    this.decodedToken.subscribe()

    return this.mobapiHttp.post<ILoginResponseData>('/auth/staff/token', {
      data: {
        ...dto,
        loginType: this.loginType,
      }
    }).pipe(
      map((data) => {
        (this.loginData as ReactiveCacheObservable<ILoginResponseData | null>).next(data)

        this.localStorageService.setItem('accessToken', data.token)
        this.localStorageService.setItem('refreshToken', data.refreshToken)
        this.localStorageService.setItem('tokenType', data.tokenType)
      })
    )
  }

  /**
   * NOOP
   */
  public register(): void {
    // not implemented
  }

  public updateToken(): Observable<ILoginResponseData | null> {
    if(!this.localStorageService.getItem('refreshToken')) {
      return of(null)
    }

    return this.mobapiHttp.post<ILoginResponseData>('/auth/staff/refresh-token', {
      data: {
        refreshToken: this.localStorageService.getItem('refreshToken'),
        loginType: this.loginType,
      }
    }).pipe(
      tap((data) => {
        this.localStorageService.setItem('accessToken', data.token)
        this.localStorageService.setItem('refreshToken', data.refreshToken)
        this.localStorageService.setItem('tokenType', data.tokenType)
      }),
      catchError((error) => {
        (this.loginData as ReactiveCacheObservable<ILoginResponseData | null>).next(null)
        this.localStorageService.removeItem('refreshToken')
        this.localStorageService.removeItem('accessToken')

        return of(null)
      }),
    )
  }
}
