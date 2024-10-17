import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import {
  MonoTypeOperatorFunction,
  Observable,
  tap,
  timeout,
  TimeoutError,
} from 'rxjs';
import { ILoginResponse } from '@app/core/interfaces/auth/login-response.interface';

export interface IRequestOptions {
  headers?: {
    [header: string]: string | string[];
  };
  observe?: 'body';
  params?:
    | HttpParams
    | {
        [param: string]:
          | string
          | number
          | boolean
          | ReadonlyArray<string | number | boolean>;
      };
  reportProgress?: boolean;
  responseType?: 'json';
  withCredentials?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class RequestService {
  private readonly _http = inject(HttpClient);

  public get<T>(
    api: string,
    url: string,
    params?:
      | HttpParams
      | {
          [param: string]:
            | string
            | number
            | boolean
            | ReadonlyArray<string | number | boolean>;
        },
    options?: IRequestOptions,
  ): Observable<T> {
    return this._http
      .get<T>(`${api}/${url}`, { ...options, params })
      .pipe(...this.getCommonPipes<T>());
  }

  public post<T>(
    api: string,
    url: string,
    body?: ILoginResponse,
    options?: IRequestOptions,
  ): Observable<T> {
    return this._http
      .post<T>(`${api}/${url}`, body, options)
      .pipe(...this.getCommonPipes<T>());
  }

  public put<T>(
    api: string,
    url: string,
    body?: unknown,
    options?: IRequestOptions,
  ): Observable<T> {
    return this._http
      .put<T>(`${api}/${url}`, body, options)
      .pipe(...this.getCommonPipes<T>());
  }

  public patch<T>(
    api: string,
    url: string,
    body?: unknown,
    id?: string,
    options?: IRequestOptions,
  ): Observable<T> {
    return this._http
      .patch<T>(`${api}/${url}${id}`, body, options)
      .pipe(...this.getCommonPipes<T>());
  }

  public delete<T>(
    api: string,
    url: string,
    options?: IRequestOptions,
  ): Observable<T> {
    return this._http
      .delete<T>(`${api}/${url}`, options)
      .pipe(...this.getCommonPipes<T>());
  }

  private getCommonPipes<T>(): [
    MonoTypeOperatorFunction<T>,
    MonoTypeOperatorFunction<T>,
  ] {
    return [
      timeout<T>(15_000),
      tap<T>({
        error: (error) => {
          // eslint-disable-next-line no-console
          console.error({ error });
          if (error instanceof TimeoutError) return;
        },
        next: (response: T | null) => {
          if (
            response !== null &&
            typeof response === 'object' &&
            'error' in response
          ) {
            // eslint-disable-next-line no-console
            console.error({ error: response.error || null });
          }
        },
      }),
    ];
  }
}
