"use client";

import { useRef } from "react";
import { motion } from "framer-motion";

interface VideoPreviewProps {
  videoUrl: string;
  onReset: () => void;
}

export function VideoPreview({ videoUrl, onReset }: VideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = videoUrl;
    a.download = "oiia-cat.mp4";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="glass-card p-8">
      <div className="flex flex-col items-center gap-6">
        <h2 className="text-2xl font-bold gradient-text">Your OIIA Cat!</h2>

        <div className="relative rounded-xl overflow-hidden shadow-2xl shadow-primary/20">
          <video
            ref={videoRef}
            src={videoUrl}
            autoPlay
            loop
            muted
            playsInline
            className="max-w-md w-full rounded-xl"
          />
        </div>

        <div className="flex gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDownload}
            className="px-6 py-3 bg-gradient-to-r from-primary to-accent rounded-xl font-semibold text-white shadow-lg"
          >
            Download MP4
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onReset}
            className="px-6 py-3 bg-dark-card border border-dark-border rounded-xl font-semibold text-white/80 hover:text-white transition-colors"
          >
            Try Another Cat
          </motion.button>
        </div>
      </div>
    </div>
  );
}