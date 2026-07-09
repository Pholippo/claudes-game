"""Headless Claude Code calls (claude -p) for judge / implement / script steps."""
from __future__ import annotations

import json
import re
import shutil
import subprocess


class ClaudeError(RuntimeError):
    pass


def run_claude(
    prompt: str,
    cwd: str,
    allowed_tools: str | None = None,
    permission_mode: str | None = None,
    timeout: int = 1200,
    claude_cmd: str = "claude",
) -> str:
    """Run `claude -p` and return its text result."""
    exe = shutil.which(claude_cmd)
    if not exe:
        raise ClaudeError(f"'{claude_cmd}' not found on PATH")
    cmd = [exe, "-p", prompt, "--output-format", "json"]
    if allowed_tools:
        cmd += ["--allowedTools", allowed_tools]
    if permission_mode:
        cmd += ["--permission-mode", permission_mode]
    proc = subprocess.run(
        cmd,
        cwd=cwd,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        timeout=timeout,
    )
    if proc.returncode != 0:
        raise ClaudeError(f"claude -p failed (rc={proc.returncode}): {proc.stderr[:2000]}")
    try:
        payload = json.loads(proc.stdout)
        result = payload.get("result", "")
    except json.JSONDecodeError:
        result = proc.stdout
    if not result or not result.strip():
        raise ClaudeError("claude -p returned an empty result")
    return result.strip()


def extract_json(text: str) -> dict:
    """Pull the first JSON object out of a model response."""
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if not match:
        raise ClaudeError(f"no JSON object in response: {text[:400]}")
    return json.loads(match.group(0))
