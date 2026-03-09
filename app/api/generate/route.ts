import { NextRequest, NextResponse } from "next/server";
import { generateVideo, type MotionPattern } from "@/lib/video-generator";
import { removeImageBackground } from "@/lib/background-removal";

export const maxDuration = 120; // Allow up to 120 seconds (background removal + video generation)

const VALID_MOTIONS = new Set(["oiia", "vibing", "bounce"]);
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get("image") as File | null;
    const motion = (formData.get("motion") as string) || "oiia";
    const shouldRemoveBackground = formData.get("removeBackground") === "true";

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

    if (imageFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Image file too large. Maximum size is 10MB" },
        { status: 400 }
      );
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
        // Fall back to original image — don't block video generation
      }
    }

    // Generate video
    const videoBuffer = await generateVideo({
      imageBuffer,
      motion: motion as MotionPattern,
      backgroundRemoved,
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
  }
}
