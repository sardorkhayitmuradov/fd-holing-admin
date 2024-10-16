import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";

import { ICCApiResponse } from "@app/core/types/api-response.type";
import { ENV } from "environments";
import { NzMessageService } from "ng-zorro-antd/message";
import { map, MonoTypeOperatorFunction, Observable, tap, timeout } from "rxjs";

import { HttpOptionsType } from "@shared/types/http-options.type";

export type CCHttpClientOptions = (HttpOptionsType & { disableErrorMessaging?: boolean }) | undefined

@Injectable({
  providedIn: "root",
})
export class CCHttpClientService {
  private readonly _http = inject(HttpClient)
  private readonly messageService = inject(NzMessageService)

  public get<T>(
    url: string,
    options: CCHttpClientOptions
  ): Observable<T> {
    url = this.editUrl(url);

    return this._http
      .get<ICCApiResponse<T>>(url, options)
      .pipe(
        ...this.getCommonPipes<T>(options),
        map((response) => response.data)
      );
  }

  public post<T>(
    url: string,
    body?: unknown,
    options?: CCHttpClientOptions
  ): Observable<T> {
    url = this.editUrl(url);

    return this._http
      .post<ICCApiResponse<T>>(url, body, options)
      .pipe(
        ...this.getCommonPipes<T>(options),
        map((response) => response.data)
      );
  }

  public put<T>(
    url: string,
    body?: unknown,
    options?: CCHttpClientOptions
  ): Observable<T> {
    url = this.editUrl(url);

    return this._http
      .put<ICCApiResponse<T>>(url, body, options)
      .pipe(
        ...this.getCommonPipes<T>(options),
        map((response) => response.data)
      );
  }

  public patch<T>(
    url: string,
    body?: unknown,
    options?: CCHttpClientOptions
  ): Observable<T> {
    url = this.editUrl(url);

    return this._http
      .patch<ICCApiResponse<T>>(url, body, options)
      .pipe(
        ...this.getCommonPipes<T>(options),
        map((response) => response.data)
      );
  }

  public delete<T>(
    url: string,
    options?: CCHttpClientOptions
  ): Observable<T> {
    url = this.editUrl(url);

    return this._http
      .delete<ICCApiResponse<T>>(url, options)
      .pipe(
        ...this.getCommonPipes<T>(options),
        map((response) => response.data)
      );
  }

  private getCommonPipes<T>(options: CCHttpClientOptions): [
    MonoTypeOperatorFunction<ICCApiResponse<T>>,
    MonoTypeOperatorFunction<ICCApiResponse<T>>,
    MonoTypeOperatorFunction<ICCApiResponse<T>>,
  ] {
    return [
      timeout<ICCApiResponse<T>>(25_000),
      map((response) => {
        if(response.error || response.status === "ERROR") {
          throw new Error(response.error.message);
        }

        return response;
      }),
      tap({
        error: (error) => {
          if(!options?.disableErrorMessaging) {
            this.messageService.error(error.message ?? 'Неивестная ошибка \t' + JSON.stringify(error), {
              nzDuration: 10_000,
            });
          }
        },
      })
    ];
  }

  private editUrl(url: string): string {
    if(url.startsWith("/")) {
      return ENV.CC_URL_PREFIX + '/cc-service-app' + url;
    } else if(url.startsWith('http')) {
      return url;
    } else {
      return ENV.CC_URL_PREFIX + "/cc-service-app/" + url;
    }
  }
}

