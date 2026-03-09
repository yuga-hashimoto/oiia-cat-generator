import sharp from "sharp";
import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";
import fs from "fs/promises";
import path from "path";
import os from "os";

// Set ffmpeg binary path
ffmpeg.setFfmpegPath(ffmpegStatic as string);

export type MotionPattern = "oiia" | "vibing" | "bounce";

interface GenerateOptions {
  imageBuffer: Buffer;
  motion: MotionPattern;
  width?: number;
  height?: number;
  fps?: number;
  duration?: number;
}

// Motion pattern definitions
const motionConfigs = {
  oiia: {
    // Classic OIIA: rhythmic left-right swing with squash & stretch
    getTransform: (t: number, frame: number, totalFrames: number) => {
      const beat = (2 * Math.PI * t * 2.5); // 2.5 beats per second
      const angle = Math.sin(beat) * 25; // +/-25 degrees
      const scaleX = 1 + Math.sin(beat) * 0.08;
      const scaleY = 1 - Math.sin(beat) * 0.05;
      const bounceY = Math.abs(Math.sin(beat * 2)) * 30;
      return { angle, scaleX, scaleY, translateY: -bounceY };
    },
  },
  vibing: {
    // Smooth nodding motion
    getTransform: (t: number) => {
      const beat = (2 * Math.PI * t * 1.5);
      const angle = Math.sin(beat) * 10;
      const scaleY = 1 + Math.sin(beat * 2) * 0.03;
      const bounceY = Math.sin(beat) * 15;
      return { angle, scaleX: 1, scaleY, translateY: -Math.abs(bounceY) };
    },
  },
  bounce: {
    // Energetic bouncing
    getTransform: (t: number) => {
      const beat = (2 * Math.PI * t * 3);
      const angle = Math.sin(beat * 0.5) * 8;
      const bounceY = Math.abs(Math.sin(beat)) * 50;
      const scaleX = 1 - Math.abs(Math.sin(beat)) * 0.05;
      const scaleY = 1 + Math.abs(Math.sin(beat)) * 0.1;
      return { angle, scaleX, scaleY, translateY: -bounceY };
    },
  },
};

// Generate a single frame using Sharp
async function generateFrame(
  imageBuffer: Buffer,
  width: number,
  height: number,
  transform: { angle: number; scaleX: number; scaleY: number; translateY: number },
  frameIndex: number
): Promise<Buffer> {
  const imgSize = Math.min(width, height) * 0.6;
  const scaledW = Math.round(imgSize * transform.scaleX);
  const scaledH = Math.round(imgSize * transform.scaleY);

  // Resize and prepare the cat image
  const resizedCat = await sharp(imageBuffer)
    .resize(scaledW, scaledH, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  // Rotate the cat image
  const rotatedCat = await sharp(resizedCat)
    .rotate(transform.angle, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const rotatedMeta = await sharp(rotatedCat).metadata();
  const rw = rotatedMeta.width || scaledW;
  const rh = rotatedMeta.height || scaledH;

  // Calculate position (centered with vertical bounce)
  const left = Math.round((width - rw) / 2);
  const top = Math.round((height - rh) / 2 + transform.translateY);

  // Generate background orbs
  const time = frameIndex / 24;
  const orbs = generateOrbsSVG(width, height, time);

  // Compose the frame: dark background + orbs + cat
  const frame = await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 13, g: 13, b: 13, alpha: 255 },
    },
  })
    .composite([
      {
        input: Buffer.from(orbs),
        top: 0,
        left: 0,
      },
      {
        input: rotatedCat,
        top: Math.max(0, top),
        left: Math.max(0, left),
      },
    ])
    .png()
    .toBuffer();

  return frame;
}

// Generate SVG for background orbs
function generateOrbsSVG(width: number, height: number, time: number): string {
  const orbs = [
    { cx: width * 0.25, cy: height * 0.3, r: 120, color: "108,92,231", speed: 0.3 },
    { cx: width * 0.75, cy: height * 0.7, r: 100, color: "253,121,168", speed: 0.5 },
    { cx: width * 0.5, cy: height * 0.5, r: 80, color: "0,206,209", speed: 0.4 },
  ];

  const orbsSvg = orbs
    .map((orb) => {
      const dx = Math.sin(time * orb.speed * 2 * Math.PI) * 30;
      const dy = Math.cos(time * orb.speed * 2 * Math.PI) * 20;
      return `<circle cx="${orb.cx + dx}" cy="${orb.cy + dy}" r="${orb.r}" fill="rgba(${orb.color},0.15)" filter="url(#blur)"/>`;
    })
    .join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <defs><filter id="blur"><feGaussianBlur stdDeviation="40"/></filter></defs>
    ${orbsSvg}
  </svg>`;
}

export async function generateVideo(options: GenerateOptions): Promise<Buffer> {
  const {
    imageBuffer,
    motion = "oiia",
    width = 600,
    height = 600,
    fps = 24,
    duration = 3,
  } = options;

  const totalFrames = fps * duration;
  const config = motionConfigs[motion];
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "oiia-"));
  const framesDir = path.join(tmpDir, "frames");
  await fs.mkdir(framesDir, { recursive: true });

  try {
    // Generate all frames
    const framePromises: Promise<void>[] = [];

    for (let i = 0; i < totalFrames; i++) {
      const t = i / fps;
      const transform = config.getTransform(t, i, totalFrames);

      framePromises.push(
        generateFrame(imageBuffer, width, height, transform, i).then(
          async (frameBuffer) => {
            const framePath = path.join(framesDir, `frame_${String(i).padStart(4, "0")}.png`);
            await fs.writeFile(framePath, frameBuffer);
          }
        )
      );
    }

    // Process frames in batches of 8 to avoid memory issues
    const batchSize = 8;
    for (let i = 0; i < framePromises.length; i += batchSize) {
      await Promise.all(framePromises.slice(i, i + batchSize));
    }

    // Encode frames to MP4 with FFmpeg
    const outputPath = path.join(tmpDir, "output.mp4");

    await new Promise<void>((resolve, reject) => {
      ffmpeg()
        .input(path.join(framesDir, "frame_%04d.png"))
        .inputFPS(fps)
        .outputOptions([
          "-c:v libx264",
          "-pix_fmt yuv420p",
          "-preset fast",
          "-crf 23",
          "-movflags +faststart",
          `-r ${fps}`,
        ])
        .output(outputPath)
        .on("end", () => resolve())
        .on("error", (err: Error) => reject(err))
        .run();
    });

    const videoBuffer = await fs.readFile(outputPath);
    return videoBuffer;
  } finally {
    // Cleanup temp files
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}
