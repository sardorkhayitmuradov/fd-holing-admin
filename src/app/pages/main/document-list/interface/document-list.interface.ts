export interface DataItem {
  id: string;
  title: string;
  document: string;
  createdDate: Date;
}

export interface DocumentAddFrom {
  title: string;
}

export interface IPaginationDocuments {
  page: number;
  limit: number;
}
