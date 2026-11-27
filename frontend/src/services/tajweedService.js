import { TAJWEED_API_URL, apiFetch } from "./api.js";

export const ERROR_KEYS = {
  audio_too_short: "badAudio",
  decode_failed: "badAudio",
  invalid_reference: "badReference",
  audio_too_large: "audioTooLarge",
  inference_failed: "checkUnavailable",
  checker_busy: "checkerBusy",
  rate_limited: "rateLimited",
  unauthorized: "checkUnavailable",
  session_unavailable: "checkUnavailable",
};

export async function checkRecitation(blob, ayah) {
  const body = new FormData();
  const extension = blob.type.includes("wav")
    ? "wav"
    : blob.type.includes("ogg")
      ? "ogg"
      : blob.type.includes("mp4")
        ? "m4a"
        : "webm";
  body.append("file", blob, `recitation.${extension}`);
  body.append("text", ayah.uthmani || ayah.indopak);
  if (ayah.surah) body.append("surah", String(ayah.surah));
  if (ayah.ayah) body.append("ayah", String(ayah.ayah));

  const response = await apiFetch(`${TAJWEED_API_URL}/check`, { method: "POST", body });
  if (response.ok) return { data: await response.json() };

  let code = "";
  let detail = "";
  try {
    ({ code, detail } = await response.json());
  } catch {
    // Non-JSON error: fall back to a generic translation key.
  }
  return { error: ERROR_KEYS[code] || (response.status === 400 && /short/i.test(detail) ? "badAudio" : "checkUnavailable") };
}
