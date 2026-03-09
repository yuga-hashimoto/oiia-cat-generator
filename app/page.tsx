"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadZone } from "@/components/upload-zone";
import { VideoPreview } from "@/components/video-preview";
import { MotionSelector, type MotionPattern } from "@/components/motion-selector";

export default function Home() {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [motionPattern, setMotionPattern] = useState<MotionPattern>("oiia");
  const [error, setError] = useState<string | null>(null);

  const handleImageSelect = useCallback((file: File) => {
    setImage(file);
    setVideoUrl(null);
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!image) return;
    setIsGenerating(true);
    setError(null);
    setVideoUrl(null);

    try {
      const formData = new FormData();
      formData.append("image", image);
      formData.append("motion", motionPattern);

      const res = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to generate video");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsGenerating(false);
    }
  }, [image, motionPattern]);

  const handleReset = useCallback(() => {
    setImage(null);
    setImagePreview(null);
    setVideoUrl(null);
    setError(null);
  }, []);

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Background orbs */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[128px] animate-float [animation-delay:3s]" />
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-4">
            <span className="gradient-text">OIIA Cat</span>
            <br />
            <span className="text-white/90">Generator</span>
          </h1>
          <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto">
            Upload your cat photo and watch it do the legendary OIIA dance.
            Free, open-source, powered by Sharp + FFmpeg.
          </p>
        </motion.div>

        {/* Main content */}
        <div className="space-y-8">
          <AnimatePresence mode="wait">
            {!videoUrl ? (
              <motion.div
                key="upload"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6"
              >
                <UploadZone
                  onImageSelect={handleImageSelect}
                  preview={imagePreview}
                  onClear={handleReset}
                />

                {image && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <MotionSelector
                      selected={motionPattern}
                      onSelect={setMotionPattern}
                    />

                    <div className="flex justify-center">
                      <button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="relative px-8 py-4 bg-gradient-to-r from-primary to-accent rounded-xl font-bold text-lg text-white shadow-lg hover:shadow-primary/25 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      >
                        {isGenerating ? (
                          <span className="flex items-center gap-3">
                            <svg
                              className="animate-spin h-5 w-5"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                              />
                            </svg>
                            Generating...
                          </span>
                        ) : (
                          "Generate OIIA Video"
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="preview"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <VideoPreview videoUrl={videoUrl} onReset={handleReset} />
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card p-4 border-red-500/50 text-center"
            >
              <p className="text-red-400">{error}</p>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-16 text-white/40 text-sm"
        >
          <p>
            Open source on{" "}
            <a
              href="https://github.com/yuga-hashimoto/oiia-cat-generator"
              className="text-primary hover:text-accent transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            {" | "}Built with Next.js, Sharp & FFmpeg
          </p>
        </motion.footer>
      </div>
    </main>
  );
}
