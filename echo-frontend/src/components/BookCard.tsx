import { FC, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Paragraph, Subheader2 } from "./Typography";
import { MoreVertical, Trash2, Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { deleteBook, updateBook } from "@/lib/bookStorage";

interface BookCardProps {
  id: string;
  title: string;
  lengthSeconds: number;
  onDelete?: () => void;
  onUpdate?: () => void;
}

export const BookCard: FC<BookCardProps> = ({
  id,
  title,
  lengthSeconds,
  onDelete,
  onUpdate,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle clicking outside of menu to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

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
    setIsMenuOpen(false);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsEditing(true);
    setIsMenuOpen(false);
  };

  const handleTitleSave = async () => {
    if (editedTitle.trim() === "") return;
    if (editedTitle === title) {
      setIsEditing(false);
      return;
    }

    try {
      await updateBook(id, { title: editedTitle });
      onUpdate?.();
    } catch (error) {
      console.error("Failed to update book title:", error);
      setEditedTitle(title); // Reset to original on error
    }
    setIsEditing(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleTitleSave();
    } else if (e.key === "Escape") {
      setEditedTitle(title);
      setIsEditing(false);
    }
  };

  return (
    <Link
      href={`/book/${id}`}
      className="group relative bg-primary-50 border rounded-xl p-12 w-full max-w-sm hover:bg-primary-200 transition-colors duration-200"
    >
      <div className="space-y-2">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={handleTitleKeyDown}
            className="w-full text-xl font-semibold text-gray-800 bg-white border rounded px-2 py-1"
            onClick={(e) => e.preventDefault()}
          />
        ) : (
          <Subheader2 className="text-xl font-semibold text-gray-800">
            {title}
          </Subheader2>
        )}
        <Paragraph className="text-gray-600">
          {formatDuration(lengthSeconds)}
        </Paragraph>
      </div>

      <div className="absolute top-4 right-4" ref={menuRef}>
        <button
          onClick={(e) => {
            e.preventDefault();
            setIsMenuOpen(!isMenuOpen);
          }}
          className={cn(
            "p-2 rounded-lg",
            "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
            "hover:bg-primary-300"
          )}
        >
          <MoreVertical className="w-5 h-5 text-gray-600" />
        </button>

        {isMenuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
            <div className="py-1">
              <button
                onClick={handleEditClick}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Title
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
};
