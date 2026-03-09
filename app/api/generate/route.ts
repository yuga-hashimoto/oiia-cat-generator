import { NextRequest, NextResponse } from "next/server";
import { generateVideo, type MotionPattern, type BgmMode } from "@/lib/video-generator";
import { removeImageBackground } from "@/lib/background-removal";
import fs from "fs/promises";
import path from "path";
import os from "os";

export const maxDuration = 120; // Allow up to 120 seconds (background removal + video generation)

const VALID_MOTIONS = new Set(["oiia", "vibing", "bounce"]);
const VALID_BGM_MODES = new Set(["off", "default", "custom"]);
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_AUDIO_SIZE = 15 * 1024 * 1024; // 15MB
const ALLOWED_AUDIO_TYPES = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/ogg",
  "audio/aac",
  "audio/mp4",
  "audio/x-m4a",
]);

export async function POST(request: NextRequest) {
  let customBgmTmpPath: string | null = null;

  try {
    const formData = await request.formData();
    const imageFile = formData.get("image") as File | null;
    const motion = (formData.get("motion") as string) || "oiia";
    const shouldRemoveBackground = formData.get("removeBackground") === "true";
    const bgmMode = (formData.get("bgmMode") as string) || "off";
    const bgmFile = formData.get("bgmFile") as File | null;

    // Validate inputs
    if (!imageFile) {
      return NextResponse.json(
        { error: "No image file provided" },
        { status: 400 }
      );
    }

    if (!VALID_MOTIONS.has(motion)) {
      return NextResponse.json(
        { error: "Invalid motion pattern. Use: oiia, vibing, or bounce" },
        { status: 400 }
      );
    }

    if (!VALID_BGM_MODES.has(bgmMode)) {
      return NextResponse.json(
        { error: "Invalid BGM mode. Use: off, default, or custom" },
        { status: 400 }
      );
    }

    if (imageFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Image file too large. Maximum size is 10MB" },
        { status: 400 }
      );
    }

    // Handle custom BGM upload
    if (bgmMode === "custom") {
      if (!bgmFile) {
        return NextResponse.json(
          { error: "Custom BGM mode requires an audio file" },
          { status: 400 }
        );
      }

      if (bgmFile.size > MAX_AUDIO_SIZE) {
        return NextResponse.json(
          { error: "Audio file too large. Maximum size is 15MB" },
          { status: 400 }
        );
      }

      if (!ALLOWED_AUDIO_TYPES.has(bgmFile.type)) {
        return NextResponse.json(
          { error: "Unsupported audio format. Use MP3, WAV, OGG, AAC, or M4A" },
          { status: 400 }
        );
      }

      // Write custom BGM to a temp file for FFmpeg
      const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "oiia-bgm-"));
      const ext = bgmFile.name.split(".").pop() || "mp3";
      customBgmTmpPath = path.join(tmpDir, `custom_bgm.${ext}`);
      const bgmArrayBuffer = await bgmFile.arrayBuffer();
      await fs.writeFile(customBgmTmpPath, Buffer.from(bgmArrayBuffer));
    }

    // Convert File to Buffer
    const arrayBuffer = await imageFile.arrayBuffer();
    let imageBuffer = Buffer.from(arrayBuffer);

    // Apply AI background removal if requested
    let backgroundRemoved = false;
    if (shouldRemoveBackground) {
      try {
        imageBuffer = await removeImageBackground(imageBuffer);
        backgroundRemoved = true;
      } catch (bgError) {
        console.warn("Background removal failed, proceeding with original image:", bgError);
        // Fall back to original image -- don't block video generation
      }
    }

    // Generate video
    const videoBuffer = await generateVideo({
      imageBuffer,
      motion: motion as MotionPattern,
      backgroundRemoved,
      bgmMode: bgmMode as BgmMode,
      customBgmPath: customBgmTmpPath || undefined,
    });

    // Return video as response
    return new NextResponse(videoBuffer, {
      status: 200,
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": "attachment; filename=oiia-cat.mp4",
        "Content-Length": videoBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Video generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate video. Please try again." },
      { status: 500 }
    );
  } finally {
    // Cleanup custom BGM temp file
    if (customBgmTmpPath) {
      const tmpDir = path.dirname(customBgmTmpPath);
      await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
    }
  }
}
