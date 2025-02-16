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
      bookSlug: book.bookSlug,
      title: book.title,
      lengthSeconds: book.lengthSeconds,
      createdAt: book.createdAt,
    };

    // Update metadata if exists, otherwise add new
    const metadataIndex = metadata.findIndex(
      (m) => m.bookSlug === book.bookSlug
    );
    if (metadataIndex >= 0) {
      metadata[metadataIndex] = newMetadata;
    } else {
      metadata.push(newMetadata);
    }

    // Save metadata
    localStorage.setItem(BOOK_METADATA_KEY, JSON.stringify(metadata));

    // Save full book data
    localStorage.setItem(`${BOOKS_KEY}-${book.bookSlug}`, JSON.stringify(book));
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

export function getBook(bookSlug: string): Book | null {
  try {
    const bookStr = localStorage.getItem(`${BOOKS_KEY}-${bookSlug}`);
    return bookStr ? JSON.parse(bookStr) : null;
  } catch (error) {
    console.error("Failed to get book:", error);
    return null;
  }
}

export function deleteBook(id: string): void {
  try {
    // Get all books to find the one to delete
    const metadata = getBookMetadata();
    const bookToDelete = metadata.find((book) => {
      const bookData = getBook(book.bookSlug);
      return bookData?.id === id;
    });

    if (!bookToDelete) {
      throw new Error("Book not found");
    }

    // Remove from metadata
    const updatedMetadata = metadata.filter((m) => {
      const bookData = getBook(m.bookSlug);
      return bookData?.id !== id;
    });
    localStorage.setItem(BOOK_METADATA_KEY, JSON.stringify(updatedMetadata));

    // Remove book data
    localStorage.removeItem(`${BOOKS_KEY}-${bookToDelete.bookSlug}`);
  } catch (error) {
    console.error("Failed to delete book:", error);
    throw new Error("Failed to delete book");
  }
}

export function getBookById(id: string): Book | null {
  try {
    const metadata = getBookMetadata();
    for (const meta of metadata) {
      const book = getBook(meta.bookSlug);
      if (book?.id === id) {
        return book;
      }
    }
    return null;
  } catch (error) {
    console.error("Failed to get book by id:", error);
    return null;
  }
}
