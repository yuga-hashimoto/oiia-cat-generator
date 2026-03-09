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
  const [removeBackground, setRemoveBackground] = useState(true);

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
      formData.append("removeBackground", removeBackground ? "true" : "false");

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
  }, [image, motionPattern, removeBackground]);

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

                    {/* AI Background Removal Toggle */}
                    <div className="glass-card p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
                            <svg
                              className="w-5 h-5 text-primary"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="text-white/90 font-medium text-sm">
                              AI Background Removal
                            </p>
                            <p className="text-white/40 text-xs">
                              Isolate your cat with ONNX AI model
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={removeBackground}
                          onClick={() => setRemoveBackground((v) => !v)}
                          className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 ${
                            removeBackground
                              ? "bg-gradient-to-r from-primary to-accent"
                              : "bg-white/20"
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                              removeBackground ? "translate-x-5" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>
                    </div>

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
