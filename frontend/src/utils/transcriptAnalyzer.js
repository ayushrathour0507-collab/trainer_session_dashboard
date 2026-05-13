/**
 * Purpose: Infers evaluation scores and organiser checks from uploaded meeting transcript text.
 */
import { METRICS } from "./scoring.js";

const scoreKeys = Object.fromEntries(METRICS.map((metric) => [metric.key, 3]));

const clampScore = (value) => Math.max(1, Math.min(5, Math.round(Number(value || 1))));

const unique = (items = []) => [...new Set(items.filter(Boolean))];

const toWords = (value = "") => String(value).toLowerCase().match(/[a-z0-9]+/g) || [];

const hasAny = (text = "", phrases = []) => {
  const clean = text.toLowerCase();
  return phrases.some((phrase) => clean.includes(phrase));
};

const countMatches = (text = "", phrases = []) => {
  const clean = text.toLowerCase();
  return phrases.reduce((count, phrase) => {
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return count + (clean.match(new RegExp(escaped, "g")) || []).length;
  }, 0);
};

const stripTags = (line = "") => line
  .replace(/<v\s+([^>]+)>/gi, "$1: ")
  .replace(/<[^>]+>/g, "")
  .replace(/&amp;/g, "&")
  .replace(/\s+/g, " ")
  .trim();

const parseTimeParts = (timeValue = "") => {
  const clean = timeValue.trim().replace(/\.\d+$/, "");
  const parts = clean.split(":").map((part) => Number(part));
  if (parts.some((part) => !Number.isFinite(part))) return null;
  if (parts.length === 3) return { hours: parts[0], minutes: parts[1], seconds: parts[2], raw: clean };
  if (parts.length === 2) return { hours: 0, minutes: parts[0], seconds: parts[1], raw: clean };
  return null;
};

const parseRelativeSeconds = (timeValue = "") => {
  const parts = parseTimeParts(timeValue);
  if (!parts) return null;
  return (parts.hours * 3600) + (parts.minutes * 60) + parts.seconds;
};

const parseAbsoluteMinutes = (line = "") => {
  const match = line.match(/\b((?:[01]?\d|2[0-3]):[0-5]\d(?::[0-5]\d)?)(?:\s*(AM|PM))?\b/i);
  if (!match) return null;
  const [hoursRaw, minutesRaw] = match[1].split(":").map((part) => Number(part));
  const marker = match[2]?.toUpperCase();
  const hasDate = /\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/.test(line);
  if (!marker && !hasDate && hoursRaw < 6) return null;
  let hours = hoursRaw;
  if (marker === "PM" && hours < 12) hours += 12;
  if (marker === "AM" && hours === 12) hours = 0;
  return (hours * 60) + minutesRaw;
};

const scheduledMinutes = (timeValue = "14:00") => {
  const [hours = 14, minutes = 0] = String(timeValue || "14:00").split(":").map((part) => Number(part));
  return (hours * 60) + minutes;
};

const looksLikeSpeaker = (line = "") => {
  const clean = line.trim();
  if (!clean || clean.length > 70) return false;
  if (/[?.!,;]$/.test(clean)) return false;
  if (/^(webvtt|note|transcript|meeting)$/i.test(clean)) return false;
  return /^[A-Za-z][A-Za-z .'-]{1,68}$/.test(clean);
};

const speakerFromPrefix = (line = "") => {
  const match = line.match(/^([^:]{2,80}):\s+(.+)$/);
  if (!match) return null;
  return { speaker: match[1].trim(), text: match[2].trim() };
};

export const parseTranscriptEntries = (transcript = "") => {
  const lines = String(transcript || "")
    .split(/\r?\n/)
    .map(stripTags)
    .filter((line) => line && !/^\d+$/.test(line) && !/^WEBVTT$/i.test(line));

  const entries = [];
  let pendingSpeaker = "";
  let pendingSeconds = null;
  let pendingAbsoluteMinutes = null;

  lines.forEach((line, index) => {
    const range = line.match(/\b(\d{1,2}:\d{2}(?::\d{2})?(?:\.\d+)?)\s*-->\s*(\d{1,2}:\d{2}(?::\d{2})?(?:\.\d+)?)\b/);
    if (range) {
      pendingSeconds = parseRelativeSeconds(range[1]);
      pendingAbsoluteMinutes = null;
      return;
    }

    const exactTime = line.match(/^(\d{1,2}:\d{2}(?::\d{2})?(?:\.\d+)?)$/);
    if (exactTime) {
      pendingSeconds = parseRelativeSeconds(exactTime[1]);
      pendingAbsoluteMinutes = parseAbsoluteMinutes(line);
      return;
    }

    if (looksLikeSpeaker(line) && lines[index + 1]?.match(/^(\d{1,2}:\d{2}(?::\d{2})?(?:\.\d+)?)$/)) {
      pendingSpeaker = line;
      return;
    }

    const inlineTime = line.match(/\b(\d{1,2}:\d{2}(?::\d{2})?(?:\.\d+)?)\b/);
    const prefixed = speakerFromPrefix(line.replace(inlineTime?.[0] || "", "").trim());
    const speaker = prefixed?.speaker || pendingSpeaker || "Unknown";
    const text = (prefixed?.text || line.replace(inlineTime?.[0] || "", "")).trim();
    const absoluteMinutes = parseAbsoluteMinutes(line);
    const seconds = inlineTime ? parseRelativeSeconds(inlineTime[1]) : pendingSeconds;

    if (text && text.length > 1) {
      entries.push({
        speaker,
        text,
        seconds: Number.isFinite(seconds) ? seconds : null,
        absoluteMinutes: Number.isFinite(absoluteMinutes) ? absoluteMinutes : pendingAbsoluteMinutes,
      });
    }

    pendingSpeaker = "";
    pendingSeconds = null;
    pendingAbsoluteMinutes = null;
  });

  return entries;
};

const detectPresenter = (entries, presenterName = "") => {
  const speakerWords = toWords(presenterName);
  const speakers = unique(entries.map((entry) => entry.speaker).filter((speaker) => speaker !== "Unknown"));
  const exact = speakers.find((speaker) => {
    const words = toWords(speaker);
    return speakerWords.length && speakerWords.every((word) => words.includes(word));
  });
  if (exact) return exact;

  const wordCounts = entries.reduce((acc, entry) => {
    acc[entry.speaker] = (acc[entry.speaker] || 0) + toWords(entry.text).length;
    return acc;
  }, {});

  return speakers.sort((a, b) => (wordCounts[b] || 0) - (wordCounts[a] || 0))[0] || "Presenter";
};

const transcriptWindowText = (entries, maxSeconds, fallbackRatio = 0.25) => {
  const withTimes = entries.filter((entry) => Number.isFinite(entry.seconds));
  const subset = withTimes.length
    ? withTimes.filter((entry) => entry.seconds <= maxSeconds)
    : entries.slice(0, Math.max(4, Math.ceil(entries.length * fallbackRatio)));
  return subset.map((entry) => entry.text).join(" ");
};

const inferStartScore = ({ entries, session, earlyText, issueCount }) => {
  const firstAbsolute = entries.find((entry) => Number.isFinite(entry.absoluteMinutes));
  if (firstAbsolute) {
    const delay = Math.max(0, firstAbsolute.absoluteMinutes - scheduledMinutes(session?.startTime));
    if (delay <= 5) return { score: 5, delay };
    if (delay <= 10) return { score: 4, delay };
    if (delay <= 15) return { score: 3, delay };
    return { score: 2, delay };
  }

  if (issueCount > 0) return { score: 2, delay: null };
  if (hasAny(earlyText, ["let's start", "lets start", "we will start", "good afternoon", "today we"])) return { score: 4, delay: null };
  return { score: 3, delay: null };
};

const inferDuration = (entries = []) => {
  const absolute = entries.filter((entry) => Number.isFinite(entry.absoluteMinutes));
  if (absolute.length >= 2) {
    let diff = absolute.at(-1).absoluteMinutes - absolute[0].absoluteMinutes;
    if (diff < 0) diff += 24 * 60;
    return diff;
  }
  const relative = entries.filter((entry) => Number.isFinite(entry.seconds));
  if (relative.length >= 2) return Math.max(0, (relative.at(-1).seconds - relative[0].seconds) / 60);
  return null;
};

const scoreFromDuration = (duration) => {
  if (!Number.isFinite(duration)) return 3;
  if (duration <= 65 && duration >= 40) return 5;
  if (duration <= 70) return 4;
  if (duration <= 80 || duration < 40) return 3;
  return 2;
};

export const analyzeTranscript = (transcript = "", session = {}) => {
  const entries = parseTranscriptEntries(transcript);
  const allText = entries.map((entry) => entry.text).join(" ");
  const earlyText = transcriptWindowText(entries, 900);
  const closingText = entries.slice(-Math.max(3, Math.ceil(entries.length * 0.15))).map((entry) => entry.text).join(" ");
  const presenter = detectPresenter(entries, session?.presenterName);
  const speakers = unique(entries.map((entry) => entry.speaker).filter((speaker) => speaker !== "Unknown"));
  const attendeeSpeakers = speakers.filter((speaker) => speaker !== presenter);
  const attendeeTurns = entries.filter((entry) => entry.speaker !== presenter && entry.speaker !== "Unknown").length;
  const turnRatio = entries.length ? attendeeTurns / entries.length : 0;
  const wordCount = toWords(allText).length;

  const questionCount = (allText.match(/\?/g) || []).length + countMatches(allText, [
    "question", "doubt", "queries", "q&a", "can you", "could you", "how do", "what is", "why", "please explain", "repeat",
  ]);
  const agendaCount = countMatches(earlyText, ["agenda", "today we", "we will cover", "first", "next", "overview", "objective"]);
  const recapCount = countMatches(closingText, ["recap", "summary", "takeaway", "thanks", "thank you", "next steps"]);
  const practicalCount = countMatches(allText, ["demo", "screen", "share screen", "hands-on", "code", "run", "build", "example", "dashboard", "colab", "console", "workflow", "lucidchart", "power bi", "n8n"]);
  const feedbackSignalCount = countMatches(allText, ["yes", "done", "clear", "understood", "good", "nice", "ok", "got it", "works", "completed"]);
  const issueCount = countMatches(allText, ["waiting for", "late", "delay", "audio issue", "network issue", "not audible", "can't hear", "cannot hear"]);
  const confusionCount = countMatches(allText, ["confused", "not clear", "repeat", "again please", "didn't understand", "cannot understand"]);
  const icebreakerDone = hasAny(earlyText, ["icebreaker", "warm up", "quick activity", "puzzle", "poll", "introduce yourself", "intro round"]);

  const startResult = inferStartScore({ entries, session, earlyText, issueCount });
  const durationMinutes = inferDuration(entries);
  const interactionScore = clampScore(2 + (attendeeSpeakers.length >= 2 ? 1 : 0) + (questionCount >= 2 ? 1 : 0) + (turnRatio >= 0.22 ? 1 : 0));
  const structureScore = clampScore(3 + (agendaCount ? 1 : 0) + (recapCount ? 1 : 0) - (issueCount >= 3 ? 1 : 0));
  const clarityScore = clampScore(4 + (feedbackSignalCount >= 5 ? 1 : 0) - (confusionCount >= 2 ? 1 : 0) - (issueCount >= 4 ? 1 : 0));
  const practicalScore = clampScore(2 + (practicalCount >= 2 ? 1 : 0) + (practicalCount >= 5 ? 1 : 0) + (practicalCount >= 9 ? 1 : 0));
  const attendeeFeedbackScore = clampScore(2 + (feedbackSignalCount >= 2 ? 1 : 0) + (attendeeSpeakers.length >= 2 ? 1 : 0) + (turnRatio >= 0.2 ? 1 : 0));
  const timeEfficiencyScore = scoreFromDuration(durationMinutes);

  const scores = {
    ...scoreKeys,
    startOnTime: startResult.score,
    structure: structureScore,
    interaction: interactionScore,
    clarity: clarityScore,
    practical: practicalScore,
    clickup: attendeeFeedbackScore,
    timeEfficiency: timeEfficiencyScore,
  };

  const checks = {
    startedOnTime: scores.startOnTime >= 4,
    icebreakerDone,
    qaDone: questionCount > 0 || hasAny(allText, ["q&a", "question and answer", "any questions"]),
    completedOnTime: scores.timeEfficiency >= 4,
  };

  const confidence = Math.min(100, Math.round(
    (entries.length ? 25 : 0)
    + (entries.some((entry) => Number.isFinite(entry.seconds) || Number.isFinite(entry.absoluteMinutes)) ? 25 : 0)
    + (speakers.length >= 2 ? 25 : 10)
    + (wordCount >= 500 ? 20 : wordCount >= 180 ? 12 : 4)
    + (questionCount || practicalCount ? 5 : 0),
  ));

  const strengths = [
    interactionScore >= 4 ? "Transcript shows attendee participation and Q&A signals" : "Session content is detectable from the transcript",
    practicalScore >= 4 ? "Transcript includes practical walkthrough or demo language" : "Core topic coverage is visible in the transcript",
    structureScore >= 4 ? "Agenda and recap signals were found" : "",
  ].filter(Boolean);

  const improvements = [
    interactionScore < 4 ? "Add more audience checkpoints and explicit question pauses" : "",
    scores.startOnTime < 4 ? "Start closer to the scheduled time or capture the actual start clearly" : "",
    practicalScore < 4 ? "Include more demo or hands-on language in the delivery" : "",
    timeEfficiencyScore < 4 ? "Keep the flow closer to the planned 60-minute window" : "",
  ].filter(Boolean);

  return {
    scores,
    checks,
    confidence,
    entriesCount: entries.length,
    speakerCount: speakers.length,
    attendeeSpeakers: attendeeSpeakers.length,
    attendeeTurns,
    presenter,
    questionCount,
    practicalCount,
    durationMinutes,
    startDelayMinutes: startResult.delay,
    wordCount,
    insights: {
      strengths: strengths.length ? strengths : ["Transcript was processed and evaluation signals were detected"],
      improvements: improvements.length ? improvements : ["Maintain the same delivery rhythm and interaction pattern"],
      audienceEngagement: `Detected ${attendeeTurns} attendee turns, ${attendeeSpeakers.length} attendee speakers, and ${questionCount} question/Q&A signals.`,
      deliveryNotes: `Transcript-based analysis completed with ${confidence}% confidence across ${entries.length} transcript entries.`,
      recommendedActions: [
        checks.qaDone ? "Continue preserving Q&A time" : "Add an explicit Q&A block before wrap-up",
        checks.icebreakerDone ? "Continue using early engagement moments" : "Add a short icebreaker or warm-up activity",
      ],
    },
  };
};

export default analyzeTranscript;
