"use client";

import { motion } from "framer-motion";

export type MotionPattern = "oiia" | "vibing" | "bounce";

interface MotionSelectorProps {
  selected: MotionPattern;
  onSelect: (pattern: MotionPattern) => void;
}

const patterns: { id: MotionPattern; name: string; description: string; emoji: string }[] = [
  {
    id: "oiia",
    name: "OIIA Classic",
    description: "The legendary head-swing dance",
    emoji: "\u{1F3B5}",
  },
  {
    id: "vibing",
    name: "Vibing Cat",
    description: "Smooth rhythmic nodding",
    emoji: "\u{1F60E}",
  },
  {
    id: "bounce",
    name: "Bounce",
    description: "Energetic up-and-down bounce",
    emoji: "\u{1FAA9}",
  },
];

export function MotionSelector({ selected, onSelect }: MotionSelectorProps) {
  return (
    <div className="glass-card p-6">
      <h3 className="text-sm font-medium text-white/50 mb-4 uppercase tracking-wider">
        Dance Style
      </h3>
      <div className="grid grid-cols-3 gap-3">
        {patterns.map((pattern) => (
          <motion.button
            key={pattern.id}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(pattern.id)}
            className={`p-4 rounded-xl border text-left transition-all duration-200 ${
              selected === pattern.id
                ? "bg-primary/20 border-primary shadow-lg shadow-primary/10"
                : "bg-dark-card/50 border-dark-border hover:border-white/20"
            }`}
          >
            <div className="text-2xl mb-2">{pattern.emoji}</div>
            <div className="font-semibold text-sm text-white/90">
              {pattern.name}
            </div>
            <div className="text-xs text-white/40 mt-1">
              {pattern.description}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}