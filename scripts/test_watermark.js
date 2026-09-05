import { execSync } from 'child_process';
import ffmpegPath from 'ffmpeg-static';
import path from 'path';
import fs from 'fs';

const video1 = 'C:\\Users\\prath\\Downloads\\Orbenyx_logo_fragments_reassembling_1080p_202609011958.mp4';
const testDir = path.resolve('public', 'test_frames');

console.log('Testing Delogo filter on bottom-right corner...');
// Test delogo filter
const delogoCmd = `"${ffmpegPath}" -ss 00:00:02 -i "${video1}" -vf "delogo=x=1620:y=980:w=290:h=90" -vframes 1 "${path.join(testDir, 'delogo_test.webp')}" -y`;
try {
  execSync(delogoCmd, { stdio: 'pipe' });
  console.log('Delogo test frame saved to public/test_frames/delogo_test.webp');
} catch (e) {
  console.log('Delogo error:', e.message);
}

// Test slight crop + zoom (removes bottom right corner completely)
const cropCmd = `"${ffmpegPath}" -ss 00:00:02 -i "${video1}" -vf "crop=in_w-100:in_h-60:50:0,scale=1920:1080:flags=lanczos" -vframes 1 "${path.join(testDir, 'crop_test.webp')}" -y`;
try {
  execSync(cropCmd, { stdio: 'pipe' });
  console.log('Crop test frame saved to public/test_frames/crop_test.webp');
} catch (e) {
  console.log('Crop error:', e.message);
}
