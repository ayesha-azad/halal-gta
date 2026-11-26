import { AYAHS, TASBEEHS } from "../data.js";
import { dayOfYear, shiftedDate } from "../store.js";

// One source of truth so Home, HUD and the story card show the same ayah/tasbeeh.
export function getDailyContent(date) {
  const target = date || new Date();
  const index = ((dayOfYear(target) % AYAHS.length) + AYAHS.length) % AYAHS.length;
  return {
    date: target,
    index,
    ayah: AYAHS[index],
    tasbeeh: TASBEEHS[(index + 2) % TASBEEHS.length],
  };
}

export const getPreviewDate = (preview) => shiftedDate(preview ? 1 : 0);
