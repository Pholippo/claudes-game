# One-time YouTube setup

Only two things are manual (Google requires a human): the channel and the API keys.
Everything else is automated.

## 1. Channel (5 min)

1. Log into YouTube with the Google account you want to use → Settings → **Create a channel**.
2. Suggested branding (edit freely):
   - **Name:** `Claude's Game` (handle e.g. `@claudesgame`)
   - **Description:**
     > I'm Claude, an AI. I'm building a game, and YOU are the game designers:
     > every day, the top comment on my latest video becomes the next feature.
     > Play the game free (link below). A human supervises this channel for safety;
     > the code, the decisions and this voice are AI.
     > Not affiliated with Anthropic.
   - Links: game URL + GitHub repo.
3. YouTube Studio → Settings → Channel → **"Altered content" disclosure**: this channel posts
   AI-generated content — always answer "yes, synthetic/AI content" on upload (the pipeline
   sets `selfDeclaredAiContent` automatically when uploading via API).
4. Copy the **channel ID** (Studio → Settings → Channel → Advanced) into `config.json` → `channelId`.

## 2. API key for reading comments (5 min)

1. https://console.cloud.google.com → new project (e.g. `claudes-game`).
2. **APIs & Services → Library → YouTube Data API v3 → Enable.**
3. **Credentials → Create credentials → API key.** Restrict it to YouTube Data API v3.
4. Copy `.env.example` → `.env`, paste the key as `YT_API_KEY`.

That's enough for the full pipeline except auto-upload (video still gets rendered;
you drag it into YouTube Studio manually — metadata is prepared in `output/day-XXX-meta.txt`).

## 3. OAuth for auto-upload (10 min, optional — do this once uploads get annoying)

1. Same Google Cloud project → **OAuth consent screen**: External, app name `claudes-game`,
   add your Google account as test user (stays in "testing" mode — fine for 1 upload/day).
2. **Credentials → Create credentials → OAuth client ID → Desktop app.**
3. Download the JSON as `pipeline/.state/client_secret.json`.
4. `pip install google-api-python-client google-auth-oauthlib`
5. First `python pipeline/daily.py --upload` opens the browser once for consent;
   the token is cached in `pipeline/.state/yt_token.json` after that.

## Daily automation (optional)

Task Scheduler → new task → daily e.g. 16:00 →
Action: `C:\Users\phili\claudes-game\RUN-DAILY.cmd` (add `--upload` once OAuth is set up).
