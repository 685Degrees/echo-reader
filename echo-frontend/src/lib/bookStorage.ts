import { Book, BookMetadata } from "@/types/book";

const BOOKS_KEY = "echo-reader-books";
const BOOK_METADATA_KEY = "echo-reader-book-metadata";

export async function saveBook(book: Book): Promise<void> {
  try {
    // Save book metadata to a separate list
    const existingMetadataStr = localStorage.getItem(BOOK_METADATA_KEY);
    const metadata: BookMetadata[] = existingMetadataStr
      ? JSON.parse(existingMetadataStr)
      : [];

    const newMetadata: BookMetadata = {
      id: book.id,
      bookSlug: book.bookSlug,
      title: book.title,
      lengthSeconds: book.lengthSeconds,
      createdAt: book.createdAt,
    };

    // Update metadata if exists, otherwise add new
    const metadataIndex = metadata.findIndex((m) => m.id === book.id);
    if (metadataIndex >= 0) {
      metadata[metadataIndex] = newMetadata;
    } else {
      metadata.push(newMetadata);
    }

    // Save metadata
    localStorage.setItem(BOOK_METADATA_KEY, JSON.stringify(metadata));

    // Save full book data
    localStorage.setItem(`${BOOKS_KEY}-${book.id}`, JSON.stringify(book));
  } catch (error) {
    console.error("Failed to save book:", error);
    throw new Error("Failed to save book");
  }
}

export function getBookMetadata(): BookMetadata[] {
  try {
    const metadataStr = localStorage.getItem(BOOK_METADATA_KEY);
    return metadataStr ? JSON.parse(metadataStr) : [];
  } catch (error) {
    console.error("Failed to get book metadata:", error);
    return [];
  }
}

export function getBookById(id: string): Book | null {
  try {
    const bookStr = localStorage.getItem(`${BOOKS_KEY}-${id}`);
    return bookStr ? JSON.parse(bookStr) : null;
  } catch (error) {
    console.error("Failed to get book:", error);
    return null;
  }
}

export function deleteBook(id: string): void {
  try {
    // Remove from metadata
    const metadata = getBookMetadata();
    const updatedMetadata = metadata.filter((m) => m.id !== id);
    localStorage.setItem(BOOK_METADATA_KEY, JSON.stringify(updatedMetadata));

    // Remove book data
    localStorage.removeItem(`${BOOKS_KEY}-${id}`);
  } catch (error) {
    console.error("Failed to delete book:", error);
    throw new Error("Failed to delete book");
  }
}

export function deleteAllBooks(): void {
  try {
    // Get all book metadata
    const metadata = getBookMetadata();

    // Delete each book's data
    metadata.forEach((book) => {
      localStorage.removeItem(`${BOOKS_KEY}-${book.id}`);
    });

    // Clear metadata
    localStorage.removeItem(BOOK_METADATA_KEY);
  } catch (error) {
    console.error("Failed to delete all books:", error);
    throw new Error("Failed to delete all books");
  }
}
