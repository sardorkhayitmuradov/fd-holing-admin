import { registerLocaleData } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import en from '@angular/common/locales/en';
import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';

import { NZ_DATE_LOCALE, provideNzI18n, ru_RU } from 'ng-zorro-antd/i18n';
import { NzMessageModule } from "ng-zorro-antd/message";
import { NzModalModule } from "ng-zorro-antd/modal";
import { provideEnvironmentNgxMask } from "ngx-mask";

import { routes } from './app.routes';

registerLocaleData(en);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideNzI18n(ru_RU),
    importProvidersFrom(
      FormsModule,
      NzMessageModule,
      NzModalModule,
    ),
    provideAnimationsAsync(),
    provideEnvironmentNgxMask(),
    provideHttpClient(),
    { provide: NZ_DATE_LOCALE, useValue: ru_RU }
  ]
};
