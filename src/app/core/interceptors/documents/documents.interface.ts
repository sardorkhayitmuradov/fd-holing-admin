export interface IDocument {
  _id: string;
  title: string;
  original: string;
  translated: string;
  viewCount: number;
  adminId: string;
  documentNumber: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export type FileType = 'original' | 'translated';

export interface SelectedFilesType {
  original: File | null;
  translated: File | null;
}

export interface IDocumentsList {
  total: number;
  page: string;
  limit: string;
  documents: IDocument[];
}

export interface IRequestDocumentList {
  page: number;
  limit: number;
}

export interface IReqeustDocumentCreate {
  title: string;
}

export interface IReqeustDocumentListSearch {
  documentNumber?: number;
  title?: string;
  createdDate?: string;
}

export interface IReqeustDocumentUpdate {
  documentNumber: string;
}
