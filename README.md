# OIIA Cat Generator

Upload your cat photo and generate a hilarious OIIA-style dance video!

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green)

## Features

- **3 Dance Styles**: OIIA Classic, Vibing Cat, Bounce
- **Real-time Preview**: See your uploaded photo before generating
- **High Quality Output**: 600x600px MP4 at 24fps
- **Dark Mode UI**: Beautiful glassmorphism design with animated background
- **Docker Ready**: One-command deployment

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Image Processing**: Sharp
- **Video Encoding**: FFmpeg (via fluent-ffmpeg)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion

## Quick Start

### Prerequisites

- Node.js 20+
- FFmpeg installed on your system

### Install FFmpeg

```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt install ffmpeg

# Windows (via chocolatey)
choco install ffmpeg
```

### Run Locally

```bash
# Clone the repo
git clone https://github.com/yuga-hashimoto/oiia-cat-generator.git
cd oiia-cat-generator

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Docker

```bash
# Build
docker build -t oiia-cat-generator .

# Run
docker run -p 3000:3000 oiia-cat-generator
```

## How It Works

1. **Upload** your cat photo (PNG, JPG, WebP)
2. **Choose** a dance style (OIIA / Vibing / Bounce)
3. **Generate** - Sharp processes each frame with rotation, squash & stretch, and bounce transforms
4. **Download** your MP4 video

### Architecture

```
Client (React) --> API Route (/api/generate)
                       |
                   Sharp (frame generation)
                       |
                   FFmpeg (MP4 encoding)
                       |
                   Response (video/mp4)
```

## API

### POST /api/generate

Generate an OIIA-style dance video from a cat image.

**Request**: `multipart/form-data`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| image | File | Yes | Cat image (PNG/JPG/WebP, max 10MB) |
| motion | string | No | Dance style: `oiia`, `vibing`, `bounce` (default: `oiia`) |

**Response**: `video/mp4` binary

## Contributing

Contributions are welcome! Feel free to:

- Add new dance styles
- Improve video quality
- Add BGM support
- Create a gallery of generated videos

## License

MIT License - see [LICENSE](LICENSE) for details.

---

Made with fun by [@yuga-hashimoto](https://github.com/yuga-hashimoto)
