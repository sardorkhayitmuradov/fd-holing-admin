import { HttpParams } from "@angular/common/http";

export type HttpQueryType = HttpParams | {
  [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean>;
} | undefined;
