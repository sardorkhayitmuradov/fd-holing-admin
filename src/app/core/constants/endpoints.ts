export interface IEndpoint {
  api: string;
  endpoints: {[key: string]: string};
  queries?: {[key: string]: string};
}
  
export const ENDPOINTS: {[key: string]: IEndpoint} = {
  auth: {
    api: "api/auth",
    endpoints: {
      login: "login"
    },
  },
  documents: {
    api: "api/documents",
    endpoints: {},
  },
} as const;
  