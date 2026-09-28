import { open, stat } from "node:fs/promises";
import { join } from "node:path";

export const runtime = "nodejs";

const videoPath = join(process.cwd(), "8225477-hd_1080_1920_25fps.mp4");

export async function GET(request: Request) {
  const { size } = await stat(videoPath);
  const range = request.headers.get("range");
  const rangeMatch = range?.match(/^bytes=(\d*)-(\d*)$/);

  if (rangeMatch) {
    const start = rangeMatch[1] ? Number(rangeMatch[1]) : 0;
    const requestedEnd = rangeMatch[2] ? Number(rangeMatch[2]) : size - 1;
    if (start >= size || requestedEnd < start) {
      return new Response(null, {
        status: 416,
        headers: { "Content-Range": `bytes */${size}` },
      });
    }

    const end = Math.min(requestedEnd, size - 1);
    const file = await open(videoPath, "r");
    const chunk = Buffer.alloc(end - start + 1);
    await file.read(chunk, 0, chunk.length, start);
    await file.close();

    return new Response(new Uint8Array(chunk), {
      status: 206,
      headers: {
        "Accept-Ranges": "bytes",
        "Content-Length": String(chunk.length),
        "Content-Range": `bytes ${start}-${end}/${size}`,
        "Content-Type": "video/mp4",
        "Cache-Control": "public, max-age=3600",
      },
    });
  }

  const file = await open(videoPath, "r");
  const content = Buffer.alloc(size);
  await file.read(content, 0, size, 0);
  await file.close();

  return new Response(new Uint8Array(content), {
    headers: {
      "Accept-Ranges": "bytes",
      "Content-Length": String(size),
      "Content-Type": "video/mp4",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
