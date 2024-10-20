import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { BehaviorSubject, map, of } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';

import { IResponse } from '@core/interfaces/reponse.interface';

import { ENDPOINTS } from '../../constants/endpoints';
import { ILoginRequestBody } from '../../interfaces/auth/login-request-body.interface';
import { ILoginResponse } from '../../interfaces/auth/login-response.interface';
import { AccessTokenStorageService } from '../root/storage.service';
import { RequestService } from './@request.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _authenticated = false;
  private readonly _isAuthenticated: BehaviorSubject<boolean> = new BehaviorSubject(false)

  public constructor(
    private readonly _http: RequestService,
    private readonly _accessTokenStorageService: AccessTokenStorageService,
    private readonly _router: Router
  ) {}

  public get isAuthenticated(): Observable<boolean> {
    return this._isAuthenticated.asObservable();
  }

  public logIn(loginBody: ILoginRequestBody): Observable<ILoginResponse> {
    return this._http
      .post(ENDPOINTS.auth.api, ENDPOINTS.auth.endpoints.login, loginBody)
      .pipe(
        map((response: IResponse<ILoginResponse>): ILoginResponse => {
          if (response.data.access_token){
            this._accessTokenStorageService.setItem(response.data.access_token);
            this._authenticated = true;
            this._isAuthenticated.next(true);
          } 

          return response.data;
        }),
      );

  }

  public logOut(): Observable<boolean> {
    this.internalAppLogout();

    return of(true);
  }

  public checkAuthenticated(): Observable<boolean> {
    if (this._authenticated) {
      return of(true);
    }

    if (!this._accessTokenStorageService.getItem()) {
      return of(false);
    }

    return of(true);
  }

  private internalAppLogout(): void {
    this._accessTokenStorageService.removeItem();
    this._authenticated = false;
    this._isAuthenticated.next(false);
  }

}
