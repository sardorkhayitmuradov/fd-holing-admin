export interface ILoginResponse {
  status: 'SUCCESS' | 'ERROR';
  data: {
    token: string;
  };
}
