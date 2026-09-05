import { execSync } from 'child_process';
import ffmpegPath from 'ffmpeg-static';
import path from 'path';
import fs from 'fs';

const video1 = 'C:\\Users\\prath\\Downloads\\Orbenyx_logo_fragments_reassembling_1080p_202609011958.mp4';
const video2 = 'C:\\Users\\prath\\Downloads\\Rock_carving_logo_reveal_sequence_202609012133_Preview_Zawa.mp4';

console.log('=== STEP 1: Inspecting Video 1 ===');
try {
  const result = execSync(`"${ffmpegPath}" -i "${video1}" -hide_banner`, { stdio: 'pipe' }).toString();
  console.log(result);
} catch (e) {
  console.log(e.stderr ? e.stderr.toString() : e.message);
}

// Extract a test frame from Video 1 at 2 seconds to inspect the watermark
const testDir = path.resolve('public', 'test_frames');
if (!fs.existsSync(testDir)) fs.mkdirSync(testDir, { recursive: true });

execSync(`"${ffmpegPath}" -ss 00:00:02 -i "${video1}" -vframes 1 -q:v 2 "${path.join(testDir, 'raw_frame.jpg')}" -y`);
console.log('Sample raw frame extracted to public/test_frames/raw_frame.jpg');
