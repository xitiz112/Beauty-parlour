"use client";

import { useRef, useState } from "react";
import { ImagePlus, LoaderCircle, Trash2, Upload } from "lucide-react";
import { upload } from "@vercel/blob/client";

type MediaFieldProps = {
  name?: string;
  label?: string;
  primaryName?: string;
  primaryFields?: Array<{ name: string; label: string; initialValue: string; required?: boolean }>;
  initialPrimary?: string;
  initialMediaUrls?: string[];
  primaryRequired?: boolean;
};

// The Blob client hides the upload route's reason behind a generic message; ask the route for it.
async function describeUploadError(error: unknown) {
  const message = error instanceof Error ? error.message : "Media upload failed.";
  if (!/client token/i.test(message)) return message;
  try {
    const response = await fetch("/api/media/upload", { cache: "no-store" });
    const body = (await response.json()) as { error?: string };
    if (body.error) return body.error;
  } catch {
    // Fall through to the generic message.
  }
  return "The upload couldn't be authorized. Check your connection and try again.";
}

export function MediaField({
  name = "mediaUrls",
  label = "Media files",
  primaryName,
  primaryFields,
  initialPrimary = "",
  initialMediaUrls = [],
  primaryRequired = false,
}: MediaFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverFields = primaryFields ?? (primaryName ? [{ name: primaryName, label: "Cover image", initialValue: initialPrimary, required: primaryRequired }] : []);
  const [primaryValues, setPrimaryValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(coverFields.map((field) => [field.name, field.initialValue])),
  );
  const [mediaUrls, setMediaUrls] = useState(() =>
    [...new Set([...initialMediaUrls, ...coverFields.map((field) => field.initialValue).filter(Boolean)])],
  );
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    if (mediaUrls.length + files.length > 50) {
      setMessage("Each record can have up to 50 media files.");
      return;
    }
    setBusy(true);
    setMessage("");
    const added: string[] = [];

    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/") && !["video/mp4", "video/webm"].includes(file.type)) {
          throw new Error(`${file.name} is not a supported image or video file.`);
        }
        if (file.size > 50 * 1024 * 1024) {
          throw new Error(`${file.name} exceeds the 50 MB upload limit.`);
        }

        const safeName = file.name.normalize("NFKD").replace(/[^a-zA-Z0-9._-]+/g, "-");
        const blob = await upload(`salon-media/${Date.now()}-${safeName}`, file, {
          access: "public",
          handleUploadUrl: "/api/media/upload",
          multipart: file.size > 5 * 1024 * 1024,
        });
        added.push(blob.url);
      }

      setMediaUrls((current) => [...new Set([...current, ...added])]);
      const unselectedCover = coverFields.find((field) => !primaryValues[field.name]);
      if (unselectedCover && added[0]) {
        setPrimaryValues((current) => ({ ...current, [unselectedCover.name]: added[0] }));
        setMediaUrls((current) => [added[0], ...current.filter((url) => url !== added[0])]);
      }
      setMessage(`${added.length} file${added.length === 1 ? "" : "s"} uploaded.`);
    } catch (error) {
      setMessage(await describeUploadError(error));
    } finally {
      setBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function removeMedia(url: string) {
    setMessage("");
    setMediaUrls((current) => current.filter((item) => item !== url));
    setPrimaryValues((current) => Object.fromEntries(
      Object.entries(current).map(([key, value]) => [key, value === url ? "" : value]),
    ));
  }

  function setAsPrimary(fieldName: string, url: string) {
    setPrimaryValues((current) => ({ ...current, [fieldName]: url }));
    setMediaUrls((current) => [url, ...current.filter((item) => item !== url)]);
  }

  return (
    <section className="media-field" aria-label={label}>
      <input type="hidden" name={name} value={JSON.stringify(mediaUrls)} />
      {coverFields.map((field) => (
        <label key={field.name}>
          {field.label} URL
          <input
            type="url"
            name={field.name}
            value={primaryValues[field.name] || ""}
            onChange={(event) => setPrimaryValues((current) => ({ ...current, [field.name]: event.target.value }))}
            required={field.required}
          />
        </label>
      ))}

      <div className="media-field-heading">
        <strong>{label}</strong>
        <span className="muted">Images or MP4/WebM · max 50 MB each</span>
      </div>
      <input
        ref={fileInputRef}
        className="media-file-input"
        type="file"
        accept="image/*,video/mp4,video/webm"
        multiple
        onChange={(event) => void handleFiles(event.currentTarget.files)}
      />
      <button
        className="btn btn-line media-upload-button"
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={busy}
      >
        {busy ? <LoaderCircle className="media-spinner" aria-hidden="true" /> : <Upload aria-hidden="true" size={17} />}
        {busy ? "Uploading…" : "Upload media"}
      </button>

      {mediaUrls.length ? (
        <ul className="media-list">
          {mediaUrls.map((url) => (
            <li key={url}>
              {url.match(/\.(mp4|webm)(\?|$)/i) ? (
                <video src={url} muted preload="metadata" />
              ) : (
                <img src={url} alt="" />
              )}
              <div className="media-item-actions">
                {coverFields.map((field) => (
                  <button
                    key={field.name}
                    type="button"
                    onClick={() => setAsPrimary(field.name, url)}
                    aria-pressed={primaryValues[field.name] === url}
                    aria-label={`Use media as ${field.label}`}
                  >
                    {primaryValues[field.name] === url ? <ImagePlus aria-hidden="true" size={15} /> : null}
                    {primaryValues[field.name] === url ? field.label : `Use ${field.label.toLowerCase()}`}
                  </button>
                ))}
                <button type="button" className="media-remove" onClick={() => void removeMedia(url)} aria-label="Remove media">
                  <Trash2 aria-hidden="true" size={15} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted media-empty">No media attached yet.</p>
      )}
      {message ? <p className="muted media-status" role="status">{message}</p> : null}
    </section>
  );
}
