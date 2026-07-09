"""Generate a voiceover mp3 with edge-tts and print its duration in seconds.

Usage:
    python video/tools/voiceover.py --text "Hello world" --out output/voiceover.mp3
    python video/tools/voiceover.py --text-file script.txt --out output/voiceover.mp3

Prints the mp3 duration in seconds on the last line of stdout, e.g.:
    DURATION_SECONDS=36.24
"""

import argparse
import asyncio
import subprocess
import sys
from pathlib import Path

DEFAULT_VOICE = "en-US-AndrewNeural"  # calm, natural male voice


def ensure_edge_tts():
    """Import edge_tts, installing it via pip if missing."""
    try:
        import edge_tts  # noqa: F401
        return
    except ImportError:
        pass
    print("edge-tts not found - installing...", file=sys.stderr)
    result = subprocess.run(
        [sys.executable, "-m", "pip", "install", "--quiet", "edge-tts"],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        print(result.stdout, file=sys.stderr)
        print(result.stderr, file=sys.stderr)
        raise SystemExit("Failed to pip install edge-tts")
    import edge_tts  # noqa: F401


async def synthesize(text: str, voice: str, out_path: Path, rate: str, pitch: str):
    import edge_tts

    communicate = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch)
    await communicate.save(str(out_path))


def probe_duration_seconds(path: Path) -> float:
    result = subprocess.run(
        [
            "ffprobe",
            "-v", "error",
            "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1",
            str(path),
        ],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        raise SystemExit(f"ffprobe failed: {result.stderr.strip()}")
    return float(result.stdout.strip())


def main():
    parser = argparse.ArgumentParser(description="Voiceover mp3 via edge-tts")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--text", help="Text to speak")
    group.add_argument("--text-file", help="Read text from this UTF-8 file")
    parser.add_argument("--out", required=True, help="Output mp3 path")
    parser.add_argument("--voice", default=DEFAULT_VOICE, help=f"Voice (default {DEFAULT_VOICE})")
    parser.add_argument("--rate", default="-4%", help="Speech rate, e.g. '-4%%' (slightly calm)")
    parser.add_argument("--pitch", default="+0Hz", help="Pitch shift, e.g. '-2Hz'")
    args = parser.parse_args()

    text = args.text if args.text is not None else Path(args.text_file).read_text(encoding="utf-8")
    text = text.strip()
    if not text:
        raise SystemExit("Empty voiceover text")

    out_path = Path(args.out).resolve()
    out_path.parent.mkdir(parents=True, exist_ok=True)

    ensure_edge_tts()
    asyncio.run(synthesize(text, args.voice, out_path, args.rate, args.pitch))

    if not out_path.exists() or out_path.stat().st_size < 1000:
        raise SystemExit("edge-tts produced no (or a suspiciously tiny) mp3")

    duration = probe_duration_seconds(out_path)
    print(f"voice={args.voice}")
    print(f"out={out_path}")
    print(f"DURATION_SECONDS={duration:.2f}")


if __name__ == "__main__":
    main()
