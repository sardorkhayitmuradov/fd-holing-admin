import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

export interface ILoginResponse {
  token: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthorizationService {
  private apiUrl = 'https://your-api-url.com/auth/login'; // Replace with your backend URL

  public constructor(private http: HttpClient) {}

  public login(credentials: {
    username: string;
    password: string;
  }): Observable<ILoginResponse> {
    return this.http.post<ILoginResponse>(this.apiUrl, credentials);
  }

  public storeToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  public logout(): void {
    localStorage.removeItem('authToken');
  }

  public getToken(): string | null {
    return localStorage.getItem('authToken');
  }
}
