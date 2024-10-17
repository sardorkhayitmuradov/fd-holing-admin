import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { of, switchMap } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';

import { ENDPOINTS } from '../../constants/endpoints';
import { ILoginRequestBody } from '../../interfaces/auth/login-request-body.interface';
import { ILoginResponse } from '../../interfaces/auth/login-response.interface';
import { IResponse } from '../../interfaces/reponse.interface';
import { AccessTokenStorageService } from '../root/storage.service';
import { RequestService } from './@request.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public constructor(
    private readonly _http: RequestService,
    private readonly _router: Router,
    private readonly _accessTokenStorageService: AccessTokenStorageService,
  ) {}

  public logIn(loginBody: ILoginRequestBody): Observable<ILoginResponse> {
    return this._http
      .post(ENDPOINTS.auth.api, ENDPOINTS.auth.endpoints.login, loginBody)
      .pipe(
        switchMap((response: IResponse<ILoginResponse>) => {
          if (response.data?.access_token) {
            this._accessTokenStorageService.setItem(response.data.access_token);
          }

          return of(response.data);
        }),
      );
  }

  public logout(): Observable<boolean> {
    const accessToken: string = this._accessTokenStorageService.getItem() || '';

    if (!accessToken) {
      this.internalAppLogout();

      return of(true);
    }

    return of(true);
  }

  private internalAppLogout(): void {
    this._accessTokenStorageService.removeItem();
    void this._router.navigate(['/']);
  }
}
