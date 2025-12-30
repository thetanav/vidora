import db from "@/lib/db";
import Link from "next/link";

export default async function Home() {
  const videos = await db.video.findMany();

  return (
    <div>
      <Link href="/upload" className="text-xl font-bold underline">
        Upload Videos
      </Link>

      <div className="grid">
        {videos.map((video) => (
          <div>
            <Link
              href={`/w/${video.id}`}
              className="text-xl font-bold underline">
              {video.title}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
