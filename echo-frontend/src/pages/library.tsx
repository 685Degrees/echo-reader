import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { BookCard } from "@/components/BookCard";
import {
  getBookMetadata,
  getBookById,
  deleteAllBooks,
} from "@/lib/bookStorage";
import { Book, BookMetadata } from "@/types/book";

export default function Library() {
  const [books, setBooks] = useState<Book[]>([]);

  const loadBooks = () => {
    const metadata = getBookMetadata();
    const fullBooks = metadata
      .map((meta) => {
        const book = getBookById(meta.id);
        return book;
      })
      .filter((book): book is Book => book !== null);
    setBooks(fullBooks);
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const handleBookDelete = () => {
    loadBooks(); // Reload books after deletion
  };

  const handleBookUpdate = () => {
    loadBooks(); // Reload books after update
  };

  const handleDeleteAll = () => {
    if (
      window.confirm(
        "Are you sure you want to delete all books? This action cannot be undone."
      )
    ) {
      deleteAllBooks();
      loadBooks(); // Reload (empty) book list
    }
  };

  return (
    <div className="bg-primary-100 min-h-screen ">
      <Header />
      <main className="pt-20 flex flex-col items-center justify-center p-8 space-y-10">
        {books.length === 0 ? (
          <div className="text-center text-gray-500">
            <p>No books in your library yet.</p>
            <p>Upload a book on the home page to get started.</p>
          </div>
        ) : (
          books.map((book) => (
            <BookCard
              key={book.id}
              id={book.id}
              title={book.title}
              lengthSeconds={book.lengthSeconds}
              onDelete={handleBookDelete}
              onUpdate={handleBookUpdate}
            />
          ))
        )}
      </main>
    </div>
  );
}
