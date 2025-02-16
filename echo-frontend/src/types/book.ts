export interface Book {
  bookSlug: string;
  title: string;
  text: string;
  audioUrl: string;
  lengthSeconds: number;
  createdAt: string;
}

export interface BookMetadata {
  bookSlug: string;
  title: string;
  lengthSeconds: number;
  createdAt: string;
}
