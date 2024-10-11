import { HttpContext, HttpHeaders } from "@angular/common/http";

import { HttpQueryType } from "@shared/types/http-query.type";

export type HttpOptionsType<R = 'json', O = 'body'> = {
  headers?: HttpHeaders | {
    [header: string]: string | string[];
  };
  observe ?: O;
  context?: HttpContext;
  params?: HttpQueryType;
  reportProgress?: boolean;
  responseType?: R;
  withCredentials?: boolean;
  transferCache?: {
    includeHeaders?: string[];
  } | boolean
}
