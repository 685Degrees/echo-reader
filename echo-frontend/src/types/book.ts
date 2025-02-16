export interface Book {
  id: string; // UUID
  bookSlug: string;
  title: string;
  text: string;
  audioUrl: string;
  lengthSeconds: number;
  createdAt: string;
}

export interface BookMetadata {
  id: string; // UUID
  bookSlug: string;
  title: string;
  lengthSeconds: number;
  createdAt: string;
}
