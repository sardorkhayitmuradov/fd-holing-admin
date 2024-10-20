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
  public readonly loginData$: BehaviorSubject<ILoginResponse | null> = new BehaviorSubject(null);

  public readonly isAuthorized: Observable<boolean> = this.loginData$.pipe(map(data => !!data))

  public constructor(
    private readonly _http: RequestService,
    private readonly _router: Router,
    private readonly _accessTokenStorageService: AccessTokenStorageService,
  ) {}

  public logIn(loginBody: ILoginRequestBody): Observable<ILoginResponse> {
    return this._http
      .post(ENDPOINTS.auth.api, ENDPOINTS.auth.endpoints.login, loginBody)
      .pipe(
        map((response: IResponse<ILoginResponse>): ILoginResponse => {
          this.loginData$.next(response.data)

          if (response.data.access_token){
            this._accessTokenStorageService.setItem(response.data.access_token);
          }

          return response.data;
        }),
      );

  }

  public logOut(): Observable<boolean> {
    this.loginData$.next(null); 
    this._accessTokenStorageService.removeItem();
    
    return of(true);
  }
}
