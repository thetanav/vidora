import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <Link href="/upload" className="text-xl font-bold underline">
        Upload Videos
      </Link>

      <div className="grid"></div>
    </div>
  );
}
