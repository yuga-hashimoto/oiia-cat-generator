"use client";

import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";

interface UploadZoneProps {
  onImageSelect: (file: File) => void;
  preview: string | null;
  onClear: () => void;
}

export function UploadZone({ onImageSelect, preview, onClear }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (file.type.startsWith("image/")) {
        onImageSelect(file);
      }
    },
    [onImageSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  return (
    <motion.div
      className={`glass-card p-8 transition-all duration-300 ${
        isDragging ? "border-primary scale-[1.02] shadow-lg shadow-primary/20" : ""
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {preview ? (
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-64 h-64 rounded-xl overflow-hidden">
            <img
              src={preview}
              alt="Your cat"
              className="w-full h-full object-cover"
            />
          </div>
          <button
            onClick={onClear}
            className="text-white/50 hover:text-white/80 text-sm transition-colors"
          >
            Choose a different photo
          </button>
        </div>
      ) : (
        <div
          className="flex flex-col items-center gap-4 cursor-pointer py-8"
          onClick={() => inputRef.current?.click()}
        >
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 16v-8m0 0l-3 3m3-3l3 3M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5"
              />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-white/80 text-lg font-medium">
              Drop your cat photo here
            </p>
            <p className="text-white/40 text-sm mt-1">
              or click to browse (PNG, JPG, WebP)
            </p>
          </div>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </motion.div>
  );
}