import { ResponseStatusesEnum } from "../enums/response-statuses.enum";
import { IError } from "./error.interface";

export interface IResponse<T> {
  status: ResponseStatusesEnum;
  isFinish: boolean;
  metaInfo?: object;
  data?: T;
  error?: IError;
}
