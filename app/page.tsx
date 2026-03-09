"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadZone } from "@/components/upload-zone";
import { VideoPreview } from "@/components/video-preview";
import { MotionSelector, type MotionPattern } from "@/components/motion-selector";

type BgmMode = "off" | "default" | "custom";

export default function Home() {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [motionPattern, setMotionPattern] = useState<MotionPattern>("oiia");
  const [error, setError] = useState<string | null>(null);
  const [removeBackground, setRemoveBackground] = useState(true);
  const [bgmMode, setBgmMode] = useState<BgmMode>("default");
  const [customBgmFile, setCustomBgmFile] = useState<File | null>(null);
  const [customBgmName, setCustomBgmName] = useState<string | null>(null);
  const bgmFileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = useCallback((file: File) => {
    setImage(file);
    setVideoUrl(null);
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleBgmFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setCustomBgmFile(file);
        setCustomBgmName(file.name);
        setBgmMode("custom");
      }
    },
    []
  );

  const handleGenerate = useCallback(async () => {
    if (!image) return;
    if (bgmMode === "custom" && !customBgmFile) {
      setError("Please upload an audio file for custom BGM.");
      return;
    }
    setIsGenerating(true);
    setError(null);
    setVideoUrl(null);

    try {
      const formData = new FormData();
      formData.append("image", image);
      formData.append("motion", motionPattern);
      formData.append("removeBackground", removeBackground ? "true" : "false");
      formData.append("bgmMode", bgmMode);
      if (bgmMode === "custom" && customBgmFile) {
        formData.append("bgmFile", customBgmFile);
      }

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
  }, [image, motionPattern, removeBackground, bgmMode, customBgmFile]);

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

                    {/* BGM Selection */}
                    <div className="glass-card p-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-accent"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-white/90 font-medium text-sm">
                            Background Music
                          </p>
                          <p className="text-white/40 text-xs">
                            Add a soundtrack to your OIIA video
                          </p>
                        </div>
                      </div>

                      {/* BGM Mode Options */}
                      <div className="grid grid-cols-3 gap-2">
                        {/* OFF */}
                        <button
                          type="button"
                          onClick={() => setBgmMode("off")}
                          className={`relative px-3 py-3 rounded-lg border text-center transition-all duration-200 ${
                            bgmMode === "off"
                              ? "border-white/40 bg-white/10 text-white"
                              : "border-white/10 bg-white/5 text-white/50 hover:border-white/20 hover:text-white/70"
                          }`}
                        >
                          <div className="text-lg mb-1">--</div>
                          <div className="text-xs font-medium">No BGM</div>
                        </button>

                        {/* Default Psytrance */}
                        <button
                          type="button"
                          onClick={() => setBgmMode("default")}
                          className={`relative px-3 py-3 rounded-lg border text-center transition-all duration-200 ${
                            bgmMode === "default"
                              ? "border-accent/60 bg-accent/15 text-accent shadow-lg shadow-accent/10"
                              : "border-white/10 bg-white/5 text-white/50 hover:border-accent/30 hover:text-white/70"
                          }`}
                        >
                          <div className="text-lg mb-1">
                            <svg
                              className="w-5 h-5 mx-auto"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"
                              />
                            </svg>
                          </div>
                          <div className="text-xs font-medium">Psytrance</div>
                        </button>

                        {/* Custom Upload */}
                        <button
                          type="button"
                          onClick={() => {
                            if (customBgmFile) {
                              setBgmMode("custom");
                            } else {
                              bgmFileInputRef.current?.click();
                            }
                          }}
                          className={`relative px-3 py-3 rounded-lg border text-center transition-all duration-200 ${
                            bgmMode === "custom"
                              ? "border-primary/60 bg-primary/15 text-primary shadow-lg shadow-primary/10"
                              : "border-white/10 bg-white/5 text-white/50 hover:border-primary/30 hover:text-white/70"
                          }`}
                        >
                          <div className="text-lg mb-1">
                            <svg
                              className="w-5 h-5 mx-auto"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                              />
                            </svg>
                          </div>
                          <div className="text-xs font-medium">Custom</div>
                        </button>
                      </div>

                      {/* Hidden file input for custom BGM */}
                      <input
                        ref={bgmFileInputRef}
                        type="file"
                        accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/aac,audio/mp4,audio/x-m4a,.mp3,.wav,.ogg,.aac,.m4a"
                        className="hidden"
                        onChange={handleBgmFileSelect}
                      />

                      {/* Show custom BGM file name */}
                      {bgmMode === "custom" && customBgmName && (
                        <div className="mt-3 flex items-center justify-between px-3 py-2 rounded-lg bg-primary/10 border border-primary/20">
                          <span className="text-xs text-primary truncate mr-2">
                            {customBgmName}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              bgmFileInputRef.current?.click();
                            }}
                            className="text-xs text-white/50 hover:text-white/80 transition-colors shrink-0"
                          >
                            Change
                          </button>
                        </div>
                      )}
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
