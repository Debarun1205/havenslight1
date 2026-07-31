const asyncHandler = require("../../utils/asyncHandler");

// MyMemory is one of the few translation APIs that's genuinely free without
// an API key for light use — no billing account required, unlike Google
// Cloud Translation. The tradeoff, stated plainly: it's rate-limited to
// ~500 words/day per IP anonymously (5000/day if a contact email is
// registered with them), and translation quality is noticeably behind
// Google Translate for less common language pairs. Good enough for short
// travel phrases; not a replacement for a paid API at real scale.
const MYMEMORY_URL = "https://api.mymemory.translated.net/get";

// @desc  Translate a short phrase
// @route POST /api/translate
const translateText = asyncHandler(async (req, res) => {
  const { text, source, target } = req.body;

  if (!text || !source || !target) {
    return res.status(400).json({ message: "text, source, and target are required" });
  }
  if (text.length > 500) {
    return res.status(400).json({ message: "Keep phrases under 500 characters" });
  }

  const params = new URLSearchParams({
    q: text,
    langpair: `${source}|${target}`,
  });
  // Registering a contact email with MyMemory raises the free daily quota
  // from ~500 to ~5000 words — optional, set via env if you have one.
  if (process.env.MYMEMORY_CONTACT_EMAIL) {
    params.set("de", process.env.MYMEMORY_CONTACT_EMAIL);
  }

  let data;
  try {
    const response = await fetch(`${MYMEMORY_URL}?${params.toString()}`);
    data = await response.json();
  } catch (err) {
    return res.status(502).json({ message: "Translation service is unreachable right now." });
  }

  if (!data.responseData || data.responseStatus >= 400) {
    return res.status(502).json({
      message: data.responseDetails || "Translation failed — try a shorter phrase or a different language pair.",
    });
  }

  res.json({
    translatedText: data.responseData.translatedText,
    match: data.responseData.match, // confidence score MyMemory reports, 0-1
  });
});

module.exports = { translateText };
