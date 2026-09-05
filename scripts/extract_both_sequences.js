import { execSync } from 'child_process';
import ffmpegPath from 'ffmpeg-static';
import path from 'path';
import fs from 'fs';

const video1 = 'C:\\Users\\prath\\Downloads\\LogoExpload.mp4';
const video2 = 'C:\\Users\\prath\\Downloads\\Rock_carving_logo_reveal_sequence_202609012133_Preview_Zawa.mp4';

const dir1 = path.resolve('public', 'sequence1');
const dir2 = path.resolve('public', 'sequence2');

if (!fs.existsSync(dir1)) fs.mkdirSync(dir1, { recursive: true });
if (!fs.existsSync(dir2)) fs.mkdirSync(dir2, { recursive: true });

// Clean old files in dir1
fs.readdirSync(dir1).forEach(f => {
  try { fs.unlinkSync(path.join(dir1, f)); } catch(e){}
});
// Clean old files in dir2
fs.readdirSync(dir2).forEach(f => {
  try { fs.unlinkSync(path.join(dir2, f)); } catch(e){}
});

console.log('🚀 Extracting Sequence 1: Logo Explode...');
const cmd1 = `"${ffmpegPath}" -i "${video1}" -vf "fps=24,scale=1920:-1:flags=lanczos" -vcodec libwebp -lossless 0 -compression_level 6 -q:v 85 "${path.join(dir1, 'frame_%03d.webp')}"`;
try {
  execSync(cmd1, { stdio: 'inherit' });
  const frames1 = fs.readdirSync(dir1).filter(f => f.endsWith('.webp'));
  const manifest1 = { frameCount: frames1.length, title: "Logo Explode", fps: 24 };
  fs.writeFileSync(path.join(dir1, 'manifest.json'), JSON.stringify(manifest1, null, 2));
  console.log(`✅ Sequence 1 Done: ${frames1.length} frames in public/sequence1/\n`);
} catch(err) {
  console.error('❌ Error on Sequence 1:', err.message);
}

console.log('🚀 Extracting Sequence 2: Rock Carving Logo Reveal...');
const cmd2 = `"${ffmpegPath}" -i "${video2}" -vf "fps=24,scale=1920:-1:flags=lanczos" -vcodec libwebp -lossless 0 -compression_level 6 -q:v 85 "${path.join(dir2, 'frame_%03d.webp')}"`;
try {
  execSync(cmd2, { stdio: 'inherit' });
  const frames2 = fs.readdirSync(dir2).filter(f => f.endsWith('.webp'));
  const manifest2 = { frameCount: frames2.length, title: "Rock Carving Logo Reveal", fps: 24 };
  fs.writeFileSync(path.join(dir2, 'manifest.json'), JSON.stringify(manifest2, null, 2));
  console.log(`✅ Sequence 2 Done: ${frames2.length} frames in public/sequence2/\n`);
} catch(err) {
  console.error('❌ Error on Sequence 2:', err.message);
}
