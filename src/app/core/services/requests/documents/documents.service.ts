import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable, of, switchMap } from 'rxjs';

import { ENDPOINTS } from '@core/constants/endpoints';
import { IDocument, IDocumentsList, IReqeustDocumentCreate, IReqeustDocumentListSearch, IReqeustDocumentUpdate, IRequestDocumentList } from '@core/interceptors/documents/documents.interface';
import { IResponse } from '@core/interfaces/reponse.interface';

import { RequestService } from '../@request.service';

@Injectable({
  providedIn: 'root',
})
export class DocumentService {
  public constructor(
    private readonly _http: RequestService,
    private readonly _httpService: HttpClient
  ) { }

  public getDocumentsList(
    params: IRequestDocumentList
  ): Observable<IDocumentsList> {
    return this._http.get(ENDPOINTS.documents.api, "", {
      ...params
    }).pipe(
      switchMap((response: IResponse<IDocumentsList>): Observable<IDocumentsList> => {
        if (!response.data.documents.length) {
          return of(null);
        }

        return of(response.data)
      })
    )
  }

  public getDocumentById(
    id: string
  ): Observable<IDocument> {
    return this._http.get(ENDPOINTS.documents.api, id).pipe(
      switchMap((response: IResponse<IDocument>): Observable<IDocument> => {
        if (!response.data) return of(null);

        return of(response.data)
      })
    )
  }

  public addDocument(body: IReqeustDocumentCreate): Observable<IDocument> {
    return this._http.post(ENDPOINTS.documents.api, ENDPOINTS.documents.endpoints.create, {
      ...body
    }, {
      headers: {
        "Access-Control-Allow-Origin": "*"
      }
    }).pipe(
      switchMap((response: IResponse<IDocument>): Observable<IDocument> => {
        if (!response.data) return of(null);

        return of(response.data);
      })
    )
  }

  public updateDocument(
    document: File,
    documentId: number,
    params: IReqeustDocumentUpdate
  ): Observable<unknown> {
    return this._http.put(ENDPOINTS.documents.api, `${documentId}`, document,
      {
        params: {
          ...params
        }
      }
    )
  }

  public downloadDocument(
    params: string
  ): Observable<unknown> {
    return this._http.get(ENDPOINTS.uploads.api, "IELTS_CERTIFICATE-244699367.pdf", {}, {
      headers: {
        'Accept': 'application/pdf',
        "Access-Control-Allow-Origin": "*",
      },
    })
  }

  public searchDocument(
    params: IReqeustDocumentListSearch
  ): Observable<IDocumentsList> {
    return this._http.get(ENDPOINTS.documents.api, ENDPOINTS.documents.endpoints.search, {
      ...params
    }).pipe(
      switchMap((response: IResponse<IDocumentsList>): Observable<IDocumentsList> => {
        if (!response.data.documents.length) {
          return of(null);
        }

        return of(response.data)
      })
    )
  }

  public viewCount(id: string): Observable<any> {
    return this._httpService.put(`${ENDPOINTS.documents.api}/${ENDPOINTS.documents.endpoints.view}/${id}`, null, {
      headers: {
        "Content-Type":'application/json',
      }
    })
  }
}
