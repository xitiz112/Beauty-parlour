import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { auth } from "@/auth";

export const runtime = "nodejs";

const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

// Why uploads would be refused right now, or null if they're allowed.
async function uploadBlocker() {
  const session = await auth();
  if (!session?.user) {
    return { session: null, error: Response.json({ error: "Your admin session has expired. Sign in again to upload media." }, { status: 401 }) };
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return {
      session,
      error: Response.json(
        { error: "Uploads aren't set up on this deployment: add BLOB_READ_WRITE_TOKEN to its environment variables and redeploy." },
        { status: 503 },
      ),
    };
  }
  return { session, error: null };
}

// The Blob client only reports "Failed to retrieve the client token", so the media field asks here for the real reason.
export async function GET() {
  const { error } = await uploadBlocker();
  return error ?? Response.json({ ok: true });
}

export async function POST(request: Request) {
  const { session, error } = await uploadBlocker();
  if (error) return error;

  try {
    const body = (await request.json()) as HandleUploadBody;
    const response = await handleUpload({
      request,
      body,
      onBeforeGenerateToken: async (pathname) => {
        if (!pathname.startsWith("salon-media/")) {
          throw new Error("Uploads must be in the salon-media folder.");
        }
        return {
          allowedContentTypes: ["image/*", "video/mp4", "video/webm"],
          maximumSizeInBytes: MAX_UPLOAD_BYTES,
          addRandomSuffix: true,
          tokenPayload: session?.user?.id,
        };
      },
    });
    return Response.json(response);
  } catch (uploadError) {
    return Response.json(
      { error: uploadError instanceof Error ? uploadError.message : "Upload could not be authorized." },
      { status: 400 },
    );
  }
}