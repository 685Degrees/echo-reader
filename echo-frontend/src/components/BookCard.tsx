import { FC, useState } from "react";
import Link from "next/link";
import { Paragraph, Subheader2 } from "./Typography";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { deleteBook } from "@/lib/bookStorage";

interface BookCardProps {
  id: string;
  bookSlug: string;
  title: string;
  lengthSeconds: number;
  onDelete?: () => void;
}

export const BookCard: FC<BookCardProps> = ({
  id,
  bookSlug,
  title,
  lengthSeconds,
  onDelete,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours} hr ${minutes} min`;
    }
    return `${minutes} min`;
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    if (!window.confirm("Are you sure you want to delete this book?")) return;

    setIsDeleting(true);
    try {
      await deleteBook(id);
      onDelete?.();
    } catch (error) {
      console.error("Failed to delete book:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Link
      href={`/book/${bookSlug}`}
      className="group relative bg-primary-50 border rounded-xl p-12 w-full max-w-sm hover:bg-primary-200 transition-colors duration-200"
    >
      <div className="space-y-2">
        <Subheader2 className="text-xl font-semibold text-gray-800">
          {title}
        </Subheader2>
        <Paragraph className="text-gray-600">
          {formatDuration(lengthSeconds)}
        </Paragraph>
      </div>

      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className={cn(
          "absolute top-4 right-4 p-2 rounded-lg",
          "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
          "hover:bg-red-100",
          isDeleting ? "cursor-not-allowed" : "cursor-pointer"
        )}
      >
        <Trash2
          className={cn(
            "w-5 h-5",
            isDeleting ? "text-gray-400" : "text-red-500"
          )}
        />
      </button>
    </Link>
  );
};
