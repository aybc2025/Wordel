// Merges a corpus-derived candidate list into public/words.json.
//
// The candidates come from tools/he_corpus_candidates.json, which is produced
// from the Hebrew Wikipedia word-frequency list (see CLAUDE.md for how it is
// built and why each filter exists). This script is the part that stays in the
// repo: it does the final merge and re-applies every structural rule, so the
// bank can be rebuilt without the 12 MB spreadsheet at hand.
//
// Crucially it also drops existing entries that the corpus has never seen —
// that is what removes fabricated words like חיהים, which are perfectly
// well-formed and so passed every earlier check.
//
// Usage: node build_words_he_corpus.cjs public/words.json tools/he_corpus_candidates.json

const fs = require("fs");

const HEBREW_LETTERS = new Set("אבגדהוזחטיכלמנסעפצקרשתךםןףץ".split(""));
const FINALS = { ך: "כ", ם: "מ", ן: "נ", ף: "פ", ץ: "צ" };

const [bankPath, candPath, attestedPath] = process.argv.slice(2);
if (!bankPath || !candPath || !attestedPath) {
  console.error(
    "usage: node build_words_he_corpus.cjs <words.json> <candidates.json> <attested.json>"
  );
  process.exit(1);
}

const existing = JSON.parse(fs.readFileSync(bankPath, "utf8"));
// [[word, corpusFrequency], ...] — the curated additions
const candidates = JSON.parse(fs.readFileSync(candPath, "utf8"));
// { word: frequency } for EVERY well-formed 5-letter token in the corpus.
// Attestation must be checked against this, not against the curated list: a
// real word can easily be missing from the curated list (filtered out as a
// prefixed form, or below the frequency floor) without being fake.
const attested = JSON.parse(fs.readFileSync(attestedPath, "utf8"));
const freq = new Map(candidates.map(([w, c]) => [w, c]));

const normalize = (w) => [...w].map((c) => FINALS[c] || c).join("");

function structurallyValid(w) {
  const chars = [...w];
  if (chars.length !== 5) return "not 5 letters";
  if (!chars.every((c) => HEBREW_LETTERS.has(c))) return "non-Hebrew character";
  if (chars.slice(0, 4).some((c) => FINALS[c])) return "final letter mid-word";
  // Note פ is deliberately absent: loanwords legitimately end in a medial פ
  // for a /p/ sound, since final ף reads as /f/ (סירופ, בישופ, קטשופ).
  if ("כמנצ".includes(chars[4])) return "ends in a medial form";
  return null;
}

const seen = new Set();
const out = [];
const dropped = [];

// 1. Existing entries survive only if the corpus attests them.
for (const entry of existing) {
  const bad = structurallyValid(entry.word);
  if (bad) {
    dropped.push([entry.word, bad]);
    continue;
  }
  if (!(entry.word in attested)) {
    dropped.push([entry.word, "not attested in corpus"]);
    continue;
  }
  const n = normalize(entry.word);
  if (seen.has(n)) continue;
  seen.add(n);
  out.push({ word: entry.word, freq: attested[entry.word] });
}

// 2. Add the corpus candidates.
let added = 0;
for (const [w, c] of candidates) {
  const bad = structurallyValid(w);
  if (bad) {
    dropped.push([w, bad]);
    continue;
  }
  const n = normalize(w);
  if (seen.has(n)) continue;
  seen.add(n);
  out.push({ word: w, freq: c });
  added++;
}

// The "common" tier is what the game draws from when the player restricts the
// random draw; frequency in a general-purpose corpus is a good proxy for
// "a word everybody knows".
const COMMON_MIN_FREQ = 200;
const final = out
  .map((o) => ({ word: o.word, common: o.freq >= COMMON_MIN_FREQ }))
  .sort((a, b) => a.word.localeCompare(b.word, "he"));

const body = final
  .map((o) => `{\n"word": "${o.word}",\n"common": ${o.common}\n}`)
  .join(",\n");
fs.writeFileSync(bankPath, `[\n${body}\n]\n`, "utf8");

console.log(`existing bank:      ${existing.length}`);
console.log(`corpus candidates:  ${candidates.length}`);
console.log(`added from corpus:  ${added}`);
console.log(`dropped:            ${dropped.length}`);
for (const [w, why] of dropped) console.log(`   ${w} — ${why}`);
console.log(`final bank:         ${final.length} (common: ${final.filter((o) => o.common).length})`);
