import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { BookCard } from "@/components/BookCard";
import { getBookMetadata } from "@/lib/bookStorage";
import { BookMetadata } from "@/types/book";

export default function Library() {
  const [books, setBooks] = useState<BookMetadata[]>([]);

  useEffect(() => {
    const loadedBooks = getBookMetadata();
    setBooks(loadedBooks);
  }, []);

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
              key={book.bookSlug}
              bookSlug={book.bookSlug}
              title={book.title}
              lengthSeconds={book.lengthSeconds}
            />
          ))
        )}
      </main>
    </div>
  );
}
