"""Upload the daily Short to YouTube (OAuth). One-time setup: docs/SETUP-YOUTUBE.md."""
from __future__ import annotations

import json
import os
import sys

SCOPES = ["https://www.googleapis.com/auth/youtube.upload"]
STATE_DIR = os.path.join(os.path.dirname(__file__), ".state")
TOKEN_FILE = os.path.join(STATE_DIR, "yt_token.json")


def _credentials():
    try:
        from google.auth.transport.requests import Request
        from google.oauth2.credentials import Credentials
        from google_auth_oauthlib.flow import InstalledAppFlow
    except ImportError:
        sys.exit(
            "Upload deps missing. Run:\n"
            "  pip install google-api-python-client google-auth-oauthlib"
        )

    creds = None
    if os.path.exists(TOKEN_FILE):
        creds = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)
    if creds and creds.expired and creds.refresh_token:
        creds.refresh(Request())
    if not creds or not creds.valid:
        secret = os.environ.get(
            "YT_CLIENT_SECRET_FILE", os.path.join(STATE_DIR, "client_secret.json")
        )
        if not os.path.exists(secret):
            sys.exit(
                f"OAuth client secret not found: {secret}\n"
                "Follow docs/SETUP-YOUTUBE.md once, then re-run."
            )
        flow = InstalledAppFlow.from_client_secrets_file(secret, SCOPES)
        creds = flow.run_local_server(port=0)
        os.makedirs(STATE_DIR, exist_ok=True)
        with open(TOKEN_FILE, "w", encoding="utf-8") as fh:
            fh.write(creds.to_json())
    return creds


def upload(video_path: str, title: str, description: str, cfg: dict) -> str:
    from googleapiclient.discovery import build
    from googleapiclient.http import MediaFileUpload

    defaults = cfg.get("uploadDefaults", {})
    yt = build("youtube", "v3", credentials=_credentials())
    body = {
        "snippet": {
            "title": title[:100],
            "description": description,
            "tags": defaults.get("tags", []),
            "categoryId": defaults.get("categoryId", "20"),
        },
        "status": {
            "privacyStatus": defaults.get("privacyStatus", "public"),
            "selfDeclaredMadeForKids": defaults.get("madeForKids", False),
        },
    }
    media = MediaFileUpload(video_path, chunksize=-1, resumable=True, mimetype="video/mp4")
    request = yt.videos().insert(part="snippet,status", body=body, media_body=media)
    response = None
    while response is None:
        _, response = request.next_chunk()
    return response["id"]


if __name__ == "__main__":
    import argparse

    ap = argparse.ArgumentParser()
    ap.add_argument("video")
    ap.add_argument("--title", required=True)
    ap.add_argument("--description", default="")
    args = ap.parse_args()
    with open(
        os.path.join(os.path.dirname(__file__), "..", "config.json"), encoding="utf-8"
    ) as fh:
        cfg = json.load(fh)
    vid = upload(args.video, args.title, args.description, cfg)
    print(f"uploaded: https://youtube.com/shorts/{vid}")
