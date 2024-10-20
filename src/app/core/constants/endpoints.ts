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
    endpoints: {
      create: "create",
      search: "search",
      view: "view"
    },
  },
  uploads: {
    api: "api/uploads",
    endpoints: {
      uploads: "uploads"
    }
  }
} as const;
  