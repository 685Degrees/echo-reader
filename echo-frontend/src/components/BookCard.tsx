import { FC } from "react";
import Link from "next/link";
import { Paragraph, Subheader2 } from "./Typography";

interface BookCardProps {
  bookSlug: string;
  title: string;
  lengthSeconds: number;
}

export const BookCard: FC<BookCardProps> = ({
  bookSlug,
  title,
  lengthSeconds,
}) => {
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours} hr ${minutes} min`;
    }
    return `${minutes} min`;
  };

  return (
    <Link
      href={`/book/${bookSlug}`}
      className="bg-primary-50 border rounded-xl p-12 w-full max-w-sm hover:bg-primary-200 transition-colors duration-200"
    >
      <div className="space-y-2">
        <Subheader2 className="text-xl font-semibold text-gray-800">
          {title}
        </Subheader2>
        <Paragraph className="text-gray-600">
          {formatDuration(lengthSeconds)}
        </Paragraph>
      </div>
    </Link>
  );
};
