import { ResponseStatusesEnum } from '../enums/response-statuses.enum';

export interface IResponse<T> {
  status: ResponseStatusesEnum;
  isFinish: boolean;
  metaInfo?: object;
  data?: T;
  message?: string;
}
