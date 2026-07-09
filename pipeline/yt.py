"""YouTube Data API helpers (read-only, API-key based). Stdlib only."""
from __future__ import annotations

import json
import os
import urllib.parse
import urllib.request

API_BASE = "https://www.googleapis.com/youtube/v3"


def load_env(repo_root: str) -> None:
    """Minimal .env loader (no dependency)."""
    path = os.path.join(repo_root, ".env")
    if not os.path.exists(path):
        return
    with open(path, "r", encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, _, value = line.partition("=")
            os.environ.setdefault(key.strip(), value.strip())


def _get(endpoint: str, params: dict) -> dict:
    key = os.environ.get("YT_API_KEY")
    if not key:
        raise RuntimeError("YT_API_KEY missing - put it in .env (see .env.example)")
    params = dict(params, key=key)
    url = f"{API_BASE}/{endpoint}?{urllib.parse.urlencode(params)}"
    with urllib.request.urlopen(url, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))


def latest_video_id(channel_id: str) -> str:
    """Most recent upload of a channel."""
    data = _get("channels", {"part": "contentDetails", "id": channel_id})
    items = data.get("items", [])
    if not items:
        raise RuntimeError(f"channel not found: {channel_id}")
    uploads = items[0]["contentDetails"]["relatedPlaylists"]["uploads"]
    data = _get("playlistItems", {"part": "contentDetails", "playlistId": uploads, "maxResults": 1})
    items = data.get("items", [])
    if not items:
        raise RuntimeError("channel has no uploads yet")
    return items[0]["contentDetails"]["videoId"]


def top_comments(video_id: str, limit: int = 5) -> list[dict]:
    """Top-level comments sorted by likes (YouTube 'relevance' order, then likeCount)."""
    data = _get(
        "commentThreads",
        {
            "part": "snippet",
            "videoId": video_id,
            "order": "relevance",
            "maxResults": max(limit * 4, 20),
            "textFormat": "plainText",
        },
    )
    out = []
    for item in data.get("items", []):
        s = item["snippet"]["topLevelComment"]["snippet"]
        text = s.get("textDisplay", "").strip()
        if len(text) < 4:
            continue
        out.append(
            {
                "author": s.get("authorDisplayName", "someone"),
                "text": text,
                "likes": int(s.get("likeCount", 0)),
            }
        )
    out.sort(key=lambda c: c["likes"], reverse=True)
    return out[:limit]
