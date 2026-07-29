"use client";

import { useState, useCallback, useRef } from "react";
import { getPublicUrl } from "@/lib/uploads/storage";
import { addReferenceKey, removeReferenceKey } from "@/lib/stores/customize";

const MAX_FILES = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface ReferenceUploaderProps {
  references: string[];
}

export default function ReferenceUploader({ references }: ReferenceUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [previewMap, setPreviewMap] = useState<Record<string, string>>({});
  const inputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const [dragover, setDragover] = useState(false);

  const canAdd = references.length < MAX_FILES;

  const uploadFile = useCallback(
    async (file: File) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setErrors((prev) => [...prev, `${file.name}: invalid type (use JPEG, PNG, or WebP)`]);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => [...prev, `${file.name}: exceeds 5MB limit`]);
        return;
      }

      setUploading(true);
      setErrors([]);

      try {
        const presignRes = await fetch("/api/uploads/presign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contentType: file.type,
            folder: "refs",
          }),
        });

        const presignJson = await presignRes.json();
        if (!presignJson.success) {
          setErrors((prev) => [
            ...prev,
            `${file.name}: ${presignJson.message || "failed to get upload URL"}`,
          ]);
          return;
        }

        const { key, uploadUrl } = presignJson.data as {
          key: string;
          uploadUrl: string;
          publicUrl: string;
        };

        const putRes = await fetch(uploadUrl, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        });

        if (!putRes.ok) {
          setErrors((prev) => [...prev, `${file.name}: upload failed (${putRes.status})`]);
          return;
        }

        const localUrl = URL.createObjectURL(file);
        setPreviewMap((prev) => ({ ...prev, [key]: localUrl }));
        addReferenceKey(key);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Upload failed";
        const isCors = msg.includes("Load failed") || msg.includes("Failed to fetch");
        setErrors((prev) => [
          ...prev,
          `${file.name}: ${isCors ? "CORS or Network error (check AWS S3 CORS settings)" : msg}`,
        ]);
      } finally {
        setUploading(false);
      }
    },
    [],
  );

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;
      const remaining = MAX_FILES - references.length;
      const files = Array.from(fileList).slice(0, remaining);
      files.forEach(uploadFile);
    },
    [references.length, uploadFile],
  );

  const handleRemove = useCallback(
    (key: string) => {
      removeReferenceKey(key);
    },
    [],
  );

  return (
    <div className="space-y-4">
      <div
        ref={dropRef}
        onDragOver={(e) => {
          e.preventDefault();
          setDragover(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragover(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDragover(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => canAdd && inputRef.current?.click()}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
          dragover
            ? "border-brand-gold bg-brand-gold/5"
            : canAdd
              ? "border-brand-primary/15 bg-brand-parchment hover:border-brand-gold"
              : "border-brand-primary/10 bg-brand-parchment/50 cursor-not-allowed"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
          disabled={!canAdd || uploading}
        />
        {uploading ? (
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-gold">
            Uploading…
          </p>
        ) : (
          <>
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-brand-gold">
              {canAdd
                ? "Drop reference images or click to browse"
                : `${MAX_FILES} images max`}
            </p>
            <p className="mt-1 font-serif text-sm italic text-brand-text/40">
              JPEG, PNG, or WebP — up to 5MB each
            </p>
          </>
        )}
      </div>

      {errors.length > 0 && (
        <div className="rounded-lg border border-brand-gold/30 bg-brand-gold/5 px-4 py-2 text-sm text-brand-gold">
          {errors.map((err, i) => (
            <p key={i}>{err}</p>
          ))}
        </div>
      )}

      {references.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
          {references.map((key) => {
            const url = previewMap[key] || getPublicUrl(key);
            return (
              <div
                key={key}
                className="group relative aspect-[4/5] overflow-hidden rounded-lg border border-brand-primary/10"
              >
                <img
                  src={url}
                  alt=""
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemove(key)}
                  className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-brand-dark/60 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
                  aria-label="Remove image"
                >
                  <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M3 3l6 6M9 3l-6 6" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
