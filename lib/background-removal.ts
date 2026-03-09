import { removeBackground } from "@imgly/background-removal-node";
import sharp from "sharp";

/**
 * Remove background from an image using @imgly/background-removal-node.
 * Uses a local ONNX model — no external API calls needed.
 * The model is automatically downloaded and cached on first run (~30MB).
 *
 * @param imageBuffer - Input image as a Buffer (PNG, JPG, WebP)
 * @returns Transparent PNG buffer with background removed
 */
export async function removeImageBackground(
  imageBuffer: Buffer
): Promise<Buffer> {
  // Convert Buffer to Blob (required by @imgly/background-removal-node)
  const blob = new Blob([imageBuffer], { type: "image/png" });

  // Run background removal with optimized settings
  const resultBlob = await removeBackground(blob, {
    model: "medium",        // Balance between quality and speed
    output: {
      format: "image/png",  // PNG to preserve transparency
      quality: 0.9,
    },
  });

  // Convert result Blob back to Buffer
  const arrayBuffer = await resultBlob.arrayBuffer();
  const resultBuffer = Buffer.from(arrayBuffer);

  // Post-process with Sharp: trim transparent edges and ensure clean alpha
  const processed = await sharp(resultBuffer)
    .trim()                  // Remove transparent border pixels
    .ensureAlpha()           // Guarantee alpha channel exists
    .png({ quality: 90 })
    .toBuffer();

  return processed;
}
