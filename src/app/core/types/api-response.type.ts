
export interface ICCApiResponse<T> {
  status: "SUCCESS" | "ERROR";
  data: T;
  error: {
    code: null | number
    message: string
    type: "NOT_FOUND"
  }
}
