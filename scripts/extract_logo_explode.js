import { execSync } from 'child_process';
import ffmpegPath from 'ffmpeg-static';
import path from 'path';
import fs from 'fs';

const video1 = 'C:\\Users\\prath\\Downloads\\LogoExpload.mp4';
const dir1 = path.resolve('public', 'sequence1');

if (!fs.existsSync(dir1)) fs.mkdirSync(dir1, { recursive: true });

// Probe video
console.log('🔍 Probing video:', video1);
try {
  const probe = execSync(`"${ffmpegPath}" -i "${video1}"`, { stdio: ['pipe', 'pipe', 'pipe'], encoding: 'utf8' });
  console.log(probe);
} catch (e) {
  console.log('Video stream info:\n', e.stderr || e.message);
}

// Clean old files in dir1
console.log('🧹 Cleaning old sequence1 frames...');
fs.readdirSync(dir1).forEach(f => {
  try { fs.unlinkSync(path.join(dir1, f)); } catch(e){}
});

console.log('🚀 Converting LogoExpload.mp4 to WebP sequence in public/sequence1/ ...');
// Extract frames at 24fps or native fps with Lanczos scaling and high quality 85 WebP
const cmd1 = `"${ffmpegPath}" -i "${video1}" -vf "fps=24,scale=1920:-1:flags=lanczos" -vcodec libwebp -lossless 0 -compression_level 6 -q:v 85 "${path.join(dir1, 'frame_%03d.webp')}"`;

try {
  execSync(cmd1, { stdio: 'inherit' });
  const frames1 = fs.readdirSync(dir1).filter(f => f.endsWith('.webp'));
  const manifest1 = { 
    frameCount: frames1.length, 
    title: "Logo Explode", 
    fps: 24,
    source: "LogoExpload.mp4"
  };
  fs.writeFileSync(path.join(dir1, 'manifest.json'), JSON.stringify(manifest1, null, 2));
  console.log(`\n🎉 Done! Extracted ${frames1.length} WebP frames to public/sequence1/`);
} catch(err) {
  console.error('❌ Error converting video:', err.message);
}
