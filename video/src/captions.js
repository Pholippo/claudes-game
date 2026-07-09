// Split a voiceover script into 2-4 word kinetic caption chunks and give each
// chunk a rough [startSec, endSec) window, assuming evenly-paced speech across
// the full voiceover duration.

const MAX_WORDS = 4;
const MIN_BREAK_WORDS = 2;
const LEAD_IN_SEC = 0.15;

export function chunkScript(script) {
  const words = String(script || "")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);

  const chunks = [];
  let current = [];
  for (const word of words) {
    current.push(word);
    const endsClause = /[.,!?:;—-]$/.test(word);
    if ((endsClause && current.length >= MIN_BREAK_WORDS) || current.length >= MAX_WORDS) {
      chunks.push(current);
      current = [];
    }
  }
  if (current.length > 0) chunks.push(current);
  return chunks;
}

export function timedChunks(script, voiceDurationSec) {
  const chunks = chunkScript(script);
  const totalWords = chunks.reduce((n, c) => n + c.length, 0);
  if (totalWords === 0 || voiceDurationSec <= 0) return [];

  const perWord = voiceDurationSec / totalWords;
  let cursor = LEAD_IN_SEC;
  return chunks.map((chunkWords) => {
    const start = cursor;
    const end = cursor + chunkWords.length * perWord;
    cursor = end;
    return {
      text: chunkWords.join(" ").replace(/[.,;:]$/, ""),
      startSec: start,
      endSec: end,
    };
  });
}
