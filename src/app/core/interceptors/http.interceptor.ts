import { HttpErrorResponse, HttpRequest } from "@angular/common/http";
import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { Router } from "@angular/router";

import { catchError, throwError } from "rxjs";

import { AuthService } from "@core/services/requests/auth.service";
import { AccessTokenStorageService } from "@core/services/root/storage.service";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const accessTokenStorageService = inject(AccessTokenStorageService);
  const authService = inject(AuthService);

  // Retrieve the access token from storage
  const accessToken: string | null = accessTokenStorageService.getItem();

  // Function to clone the request with the token
  const getClonedRequestWithToken = (req: HttpRequest<unknown>): HttpRequest<unknown> => {
    const headers = req.headers.set("x-realm", "fd-holding");

    if (!req.url.includes("auth") && accessToken) {
      return req.clone({
        headers: headers
          .set("Authorization", "Bearer " + accessToken),
      });
    }

    return req.clone({ headers }); // Return the original request if no token or "auth" URL
  };

  const newReq = getClonedRequestWithToken(req); // Clone the request with the token if necessary

  // Continue with the request handling and error catching
  return next(newReq).pipe(
    catchError((error) => {
      if (
        error instanceof HttpErrorResponse &&
        (error.status === 401 || error.status === 403) &&
        !router.url.includes("auth")
      ) {
        authService.logOut(); // Log out the user on 401 or 403 error
      }

      return throwError(() => error); // Rethrow the error for further handling
    })
  );
};
