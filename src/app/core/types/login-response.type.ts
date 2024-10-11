export interface ILoginResponseData {
  token: string
  expiresIn: number // in seconds
  refreshExpiresIn: number // in seconds
  refreshToken: string
  tokenType: string
}
