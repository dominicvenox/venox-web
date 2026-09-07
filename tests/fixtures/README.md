# Media fixture

`scrub.mp4` is an original synthetic two-second H.264 test pattern. It has no audio
and is used only to verify real browser seeking and fallback behavior. It is excluded
from the installable skill archive. No FFmpeg installation is needed to run tests.

Reproduction command (FFmpeg is needed only to regenerate):

```sh
ffmpeg -f lavfi -i 'testsrc2=size=480x270:rate=24:duration=2' -an -c:v libx264 -crf 30 -pix_fmt yuv420p -g 4 -movflags +faststart scrub.mp4
```
