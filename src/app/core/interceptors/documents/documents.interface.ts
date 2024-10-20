export interface IDocument {
  _id: string,
  title: string,
  document: string,
  viewCount: number,
  adminId: string,
  documentNumber: string,
  createdAt: string,
  updatedAt: string,
  __v: number
}

export interface IDocumentsList {
  total: number,
  page: string,
  limit: string,
  documents: IDocument[]
}

export interface IRequestDocumentList {
  page: number;
  limit: number;
}

export interface IReqeustDocumentCreate {
  title: string
}

export interface IReqeustDocumentListSearch {
  documentNumber?: number;
  title?: string;
  createdDate?: string;
  docName?: string;
}

export interface IReqeustDocumentUpdate {
  documentNumber: string
}