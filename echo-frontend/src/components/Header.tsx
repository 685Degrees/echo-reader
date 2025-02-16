import Image from "next/image";
import Link from "next/link";

export function Header() {
  return (
    <header>
      <div className="w-full flex items-center justify-center mx-auto p-3 ">
        <Link href="/" className="inline-block">
          <Image
            src="/echo-logo.png"
            alt="Echo"
            width={120}
            height={40}
            priority
          />
        </Link>
      </div>
    </header>
  );
}
