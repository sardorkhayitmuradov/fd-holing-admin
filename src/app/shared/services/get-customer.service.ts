import { inject, Injectable } from "@angular/core";

import { catchError, Observable, of, tap } from "rxjs";

import { CCHttpClientService } from "@shared/services/cc-http-client.service";
import { ClientDataInterface } from "@shared/types/client-data.type";

export interface GetCustomerDto {
  phone?: string;
  documentSeries?: string;
  documentNumber?: string;
  pinfl?: string;
}

@Injectable({
  providedIn: 'root',
})
export class GetCustomerService {
  private readonly ccHttp = inject(CCHttpClientService);
  private readonly clientsDataMap = new Map<string, ClientDataInterface | null>();

  public getCustomer(dto: GetCustomerDto): Observable<ClientDataInterface | null> {
    const params: Partial<GetCustomerDto> = {}

    if(dto.phone) {
      params.phone = dto.phone
      if(this.clientsDataMap.has(dto.phone)) {
        return of(this.clientsDataMap.get(dto.phone) ?? null)
      }
    }

    if(dto.documentSeries) {
      params.documentSeries = dto.documentSeries
    }

    if(dto.documentNumber) {
      params.documentNumber = dto.documentNumber
    }

    if(dto.pinfl) {
      params.pinfl = dto.pinfl
    }

    return this.ccHttp.get<ClientDataInterface>( '/customer', { params, disableErrorMessaging: true }).pipe(
      tap((data) => {
        if(dto.phone) {
          this.clientsDataMap.set(dto.phone, data)
        }
      }),
      catchError(() => of(null))
    )
  }
}
