"""
CLAUDE'S GAME - daily pipeline.

  fetch top comment -> judge -> claude implements -> smoke test (auto-revert)
  -> deploy (git push / GitHub Pages) -> capture gameplay -> voiceover -> Remotion
  render -> (optional) YouTube upload.

Usage:
  python pipeline/daily.py                     # full run (needs YT_API_KEY + channelId)
  python pipeline/daily.py --prompt "add lava" --author "philipp"   # manual prompt
  python pipeline/daily.py --skip-video        # code + deploy only
  python pipeline/daily.py --dry-run           # judge only, change nothing
  python pipeline/daily.py --upload            # also upload the Short (needs OAuth)
"""
from __future__ import annotations

import argparse
import datetime
import json
import os
import re
import subprocess
import sys

import agent
import yt

REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
PROMPTS = os.path.join(REPO, "pipeline", "prompts")
OUTPUT = os.path.join(REPO, "output")


def sh(args: list[str], check: bool = True, timeout: int = 900) -> subprocess.CompletedProcess:
    print(f"  $ {' '.join(args)}")
    return subprocess.run(
        args, cwd=REPO, check=check, timeout=timeout,
        capture_output=True, text=True, encoding="utf-8", errors="replace",
    )


def load_prompt(name: str, **kw: str) -> str:
    with open(os.path.join(PROMPTS, f"{name}.md"), encoding="utf-8") as fh:
        template = fh.read()
    for key, value in kw.items():
        template = template.replace("{" + key + "}", str(value))
    return template


def current_day() -> int:
    with open(os.path.join(REPO, "game", "day.js"), encoding="utf-8") as fh:
        match = re.search(r"GAME_DAY\s*=\s*(\d+)", fh.read())
    if not match:
        raise RuntimeError("could not read GAME_DAY from game/day.js")
    return int(match.group(1))


def get_candidates(args: argparse.Namespace, cfg: dict) -> list[dict]:
    if args.prompt:
        return [{"author": args.author or "the community", "text": args.prompt, "likes": 0}]
    video_id = cfg.get("videoIdOverride") or ""
    if not video_id:
        channel = cfg.get("channelId") or ""
        if not channel:
            sys.exit("config.json: channelId is empty and no --prompt given. "
                     "Set the channel id (docs/SETUP-YOUTUBE.md) or pass --prompt.")
        video_id = yt.latest_video_id(channel)
        print(f"  latest video: https://youtu.be/{video_id}")
    candidates = yt.top_comments(video_id, cfg.get("maxCommentCandidates", 5))
    if not candidates:
        sys.exit("no usable comments found on the latest video")
    return candidates


def git_revert_game() -> None:
    sh(["git", "checkout", "--", "game", "CHANGELOG.md"], check=False)


def implement_one(candidate: dict, day: int, cfg: dict, dry_run: bool) -> dict | None:
    """Judge + implement + smoke for one candidate. Returns result dict or None."""
    print(f"\n[judge] {candidate['author']}: {candidate['text'][:90]!r} ({candidate['likes']} likes)")
    verdict = agent.extract_json(agent.run_claude(
        load_prompt("judge", author=candidate["author"], text=candidate["text"]),
        cwd=REPO, claude_cmd=cfg.get("claudeCmd", "claude"),
    ))
    print(f"  -> {verdict.get('verdict')}: {verdict.get('reason')}")
    if verdict.get("verdict") != "allow":
        return None
    if dry_run:
        print("  (dry-run: stopping before implementation)")
        return {"feature_name": verdict.get("feature_name", "?"), "summary": "(dry-run)",
                "candidate": candidate}

    print(f"[implement] day {day}: {verdict.get('feature_name')}")
    author_js = candidate["author"].replace("\\", "").replace('"', "'")
    result = agent.extract_json(agent.run_claude(
        load_prompt(
            "implement", day=day, author=candidate["author"], author_js=author_js,
            text=candidate["text"], feature_name=verdict.get("feature_name", "the feature"),
            date=datetime.date.today().isoformat(),
        ),
        cwd=REPO,
        allowed_tools="Read Edit Write Glob Grep",
        permission_mode="acceptEdits",
        claude_cmd=cfg.get("claudeCmd", "claude"),
    ))
    print(f"  -> {result.get('summary')}")

    print("[smoke] verifying the game still works")
    smoke = sh(["node", os.path.join("pipeline", "smoke.mjs")], check=False, timeout=120)
    print("  " + (smoke.stdout or smoke.stderr).strip())
    if smoke.returncode != 0:
        print("  smoke FAILED -> reverting game changes")
        git_revert_game()
        return None
    result["candidate"] = candidate
    return result


def make_video(day: int, result: dict, cfg: dict, is_intro: bool = False) -> str:
    os.makedirs(OUTPUT, exist_ok=True)
    tag = f"day-{day:03d}"
    gameplay = os.path.join(OUTPUT, f"{tag}-gameplay.mp4")
    vo_mp3 = os.path.join(OUTPUT, f"{tag}-vo.mp3")
    final = os.path.join(OUTPUT, f"{tag}.mp4")
    candidate = result["candidate"]

    print("[capture] recording gameplay")
    sh(["node", os.path.join("video", "tools", "capture.mjs"), "--out", gameplay], timeout=300)

    print("[voiceover] writing script")
    script = agent.run_claude(
        load_prompt("voiceover", day=day, author=candidate["author"],
                    text=candidate["text"], summary=result.get("summary", "")),
        cwd=REPO, claude_cmd=cfg.get("claudeCmd", "claude"),
    ).strip()
    print(f"  script: {script[:120]}...")
    sh([sys.executable, os.path.join("video", "tools", "voiceover.py"),
        "--text", script, "--out", vo_mp3], timeout=180)

    props = {
        "day": day,
        "promptText": candidate["text"][:220],
        "promptAuthor": candidate["author"],
        "script": script,
        "voiceoverSrc": vo_mp3,
        "gameplaySrc": gameplay,
        "isIntro": is_intro,
    }
    props_path = os.path.join(OUTPUT, f"{tag}-props.json")
    with open(props_path, "w", encoding="utf-8") as fh:
        json.dump(props, fh, ensure_ascii=False, indent=2)

    print("[render] Remotion")
    sh(["node", os.path.join("video", "render_daily.mjs"),
        "--props", props_path, "--out", final], timeout=1800)
    return final


def write_meta(day: int, result: dict, cfg: dict) -> tuple[str, str]:
    candidate = result["candidate"]
    title = f"Day {day}: {result.get('feature_name', 'a new feature')} — an AI builds your game"
    description = (
        f"I'm Claude, an AI. Every day the top comment becomes a feature of my game.\n\n"
        f"Day {day}: \"{candidate['text'][:150]}\" — requested by {candidate['author']}\n\n"
        f"PLAY IT FREE: {cfg.get('gameUrl')}\n"
        f"Source code: {cfg.get('repoUrl')}\n\n"
        f"Top comment on this video decides what I build tomorrow.\n"
        f"#ai #gamedev #claude"
    )
    path = os.path.join(OUTPUT, f"day-{day:03d}-meta.txt")
    with open(path, "w", encoding="utf-8") as fh:
        fh.write(f"TITLE:\n{title}\n\nDESCRIPTION:\n{description}\n")
    print(f"  upload metadata: {path}")
    return title, description


def main() -> None:
    ap = argparse.ArgumentParser(description="CLAUDE'S GAME daily pipeline")
    ap.add_argument("--prompt", help="manual prompt (skips YouTube fetch)")
    ap.add_argument("--author", help="author name for --prompt")
    ap.add_argument("--dry-run", action="store_true", help="judge only, change nothing")
    ap.add_argument("--skip-video", action="store_true")
    ap.add_argument("--skip-deploy", action="store_true")
    ap.add_argument("--upload", action="store_true", help="upload the Short via OAuth")
    args = ap.parse_args()

    yt.load_env(REPO)
    with open(os.path.join(REPO, "config.json"), encoding="utf-8") as fh:
        cfg = json.load(fh)

    day = current_day() + 1
    print(f"=== CLAUDE'S GAME - day {day} ===")

    dirty = sh(["git", "status", "--porcelain"], check=False).stdout.strip()
    if dirty and not args.dry_run:
        sys.exit("repo has uncommitted changes - commit or stash first:\n" + dirty)

    candidates = get_candidates(args, cfg)
    result = None
    for candidate in candidates[: cfg.get("maxImplementAttempts", 3)]:
        result = implement_one(candidate, day, cfg, args.dry_run)
        if result:
            break
    if not result:
        sys.exit("no candidate survived judge + smoke test - nothing shipped today")
    if args.dry_run:
        print("\ndry-run done.")
        return

    if not args.skip_deploy:
        print("[deploy] commit + push (GitHub Pages)")
        sh(["git", "add", "-A"])
        sh(["git", "commit", "-m",
            f"feat: day {day} - {result.get('feature_name')} "
            f"(requested by {result['candidate']['author']})"])
        sh(["git", "push"])
        print(f"  live in ~1 min: {cfg.get('gameUrl')}")

    if not args.skip_video:
        final = make_video(day, result, cfg)
        title, description = write_meta(day, result, cfg)
        print(f"\nVIDEO READY: {final}")
        if args.upload:
            import upload as up
            video_id = up.upload(final, title, description, cfg)
            print(f"UPLOADED: https://youtube.com/shorts/{video_id}")

    print("\ndone.")


if __name__ == "__main__":
    main()
