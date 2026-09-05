/**
 * Self-Contained Video to WebP Sequence Converter
 * Uses bundled ffmpeg-static binary (No external FFmpeg installation required!)
 *
 * Usage:
 *   node scripts/convert_video_to_webp.js <path-to-video> [fps] [quality] [width]
 */

import { execSync } from 'child_process';
import ffmpegPath from 'ffmpeg-static';
import path from 'path';
import fs from 'fs';

const args = process.argv.slice(2);
const videoInput = args[0];
const fps = args[1] || 24;
const quality = args[2] || 85;
const width = args[3] || 1920;

if (!videoInput) {
  console.log(`
============================================================
🎬 ORBENYX VIDEO TO WEBP CONVERTER (Standalone)
============================================================
Usage:
  node scripts/convert_video_to_webp.js <video-file> [fps=24] [quality=85] [width=1920]

Examples:
  node scripts/convert_video_to_webp.js video.mp4
  node scripts/convert_video_to_webp.js video.mp4 30 85 1920
============================================================
`);
  process.exit(0);
}

const resolvedVideoPath = path.resolve(videoInput);

if (!fs.existsSync(resolvedVideoPath)) {
  console.error(`\n❌ Error: File not found: "${resolvedVideoPath}"\n`);
  process.exit(1);
}

const outputDir = path.resolve('public', 'sequence');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Clean previous sequence files
const existingFiles = fs.readdirSync(outputDir).filter(f => f.endsWith('.webp') || f.endsWith('.png') || f.endsWith('.jpg') || f === 'manifest.json');
console.log(`\n🧹 Cleaning previous sequence (${existingFiles.length} files removed)...`);
for (const f of existingFiles) {
  try { fs.unlinkSync(path.join(outputDir, f)); } catch (e) {}
}

console.log(`\n🚀 Converting "${path.basename(resolvedVideoPath)}" to WebP sequence...`);
console.log(`📁 Output Directory: ${outputDir}`);
console.log(`⚙️ Parameters: ${fps} FPS | Quality: ${quality}% | Width: ${width}px\n`);

const ffmpegCmd = `"${ffmpegPath}" -i "${resolvedVideoPath}" -vf "fps=${fps},scale=${width}:-1:flags=lanczos" -vcodec libwebp -lossless 0 -compression_level 6 -q:v ${quality} "${path.join(outputDir, 'frame_%03d.webp')}"`;

try {
  execSync(ffmpegCmd, { stdio: 'inherit' });
  const generatedFrames = fs.readdirSync(outputDir).filter(f => f.startsWith('frame_') && f.endsWith('.webp'));
  
  // Save manifest.json for automated runtime detection in the web app
  const manifest = {
    frameCount: generatedFrames.length,
    fps: Number(fps),
    format: 'webp',
    width: Number(width),
    updatedAt: new Date().toISOString()
  };
  
  fs.writeFileSync(path.join(outputDir, 'manifest.json'), JSON.stringify(manifest, null, 2));

  console.log(`\n✅ Done! Extracted ${generatedFrames.length} high-res WebP frames.`);
  console.log(`📄 Saved sequence metadata to: public/sequence/manifest.json`);
  console.log(`👉 Refresh http://localhost:5173/ to see your video scrubbing smoothly in real time!`);
} catch (err) {
  console.error(`\n❌ Error during conversion:`, err.message);
}
