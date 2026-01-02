import db from "@/lib/db";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Upload } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function Page() {
  const videos = await db.video.findMany();
  return (
    <main className="pt-24 px-6">
      {videos.length === 0 ? (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Upload className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No videos yet
            </h3>
            <p className="text-gray-600 text-center mb-6">
              Upload your first video to get started
            </p>
            <Link href="/upload">
              <Button className="gap-2">
                <Upload className="w-4 h-4" />
                Upload Video
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Your Videos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.map((video) => (
              <Link key={video.id} href={`/w/${video.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base line-clamp-2">
                      {video.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground">
                      Created {new Date(video.createdAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
