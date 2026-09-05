# 📁 Sequence Directory Guide

Place your sequence frames here!

### Expected File Naming:
```
frame_001.webp
frame_002.webp
frame_003.webp
...
frame_120.webp
```

### Optimal Export Settings:
- **Format**: `.webp`
- **Quality**: `82% – 88%`
- **Resolution**: `1920x1080` (or `2560x1440`)
- **Framerate**: `24fps` to `60fps` (60 to 180 total frames is recommended for a balanced 400vh scroll track)

### Converting Video to WebP using FFmpeg:
If you have a video file `input.mp4`:
```bash
ffmpeg -i input.mp4 -vf "fps=30,scale=1920:-1" -vcodec libwebp -lossless 0 -compression_level 6 -q:v 85 public/sequence/frame_%03d.webp
```

*Note: If no files are placed in this folder, the engine automatically synthesizes an ultra-crisp 3D procedural cybernetic sequence on the fly.*
