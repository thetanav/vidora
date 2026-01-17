import { NextResponse } from "next/server";

export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  return NextResponse.json({
    url: `${process.env.R2_PUBLIC_URL}/${id}/index.m3u8`,
  });
}
