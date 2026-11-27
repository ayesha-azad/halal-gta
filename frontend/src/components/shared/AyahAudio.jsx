import React, { useEffect, useRef, useState } from "react";
import { Pause, Play, Repeat2, RotateCcw } from "lucide-react";
import T from "./T.jsx";
import { tr } from "../../i18n/translations.js";
import { useAppStore } from "../../store/useAppStore.js";

// Quran Cloud serves the same ayah text used in the app as verse-by-verse MP3.
// `number` is the global ayah number returned by /api/ayah-of-day (or the
// bundled offline ayah), so the reciter always matches the displayed ayah.
const audioUrl = (number) =>
  number ? `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${number}.mp3` : "";

export default function AyahAudio({ ayah, compact = false }) {
  const lang = useAppStore((s) => s.lang);
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [loop, setLoop] = useState(false);
  const [error, setError] = useState(false);
  const url = audioUrl(ayah?.number);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    setPlaying(false);
    setError(false);
  }, [url]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.loop = loop;
  }, [loop]);

  useEffect(() => () => audioRef.current?.pause(), []);

  const play = async () => {
    const audio = audioRef.current;
    if (!audio || !url) return;
    setError(false);
    try {
      await audio.play();
    } catch {
      setError(true);
      setPlaying(false);
    }
  };

  const stop = () => {
    audioRef.current?.pause();
    setPlaying(false);
  };

  const replay = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    play();
  };

  const toggleLoop = () => setLoop((value) => !value);

  const disabled = !url || error;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${compact ? "" : "mt-4"}`}>
      <audio
        ref={audioRef}
        src={url}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onError={() => {
          setError(true);
          setPlaying(false);
        }}
      />
      <button
        type="button"
        onClick={playing ? stop : play}
        disabled={disabled}
        aria-label={tr(lang, playing ? "stopListening" : "listenAyah")}
        className="btn btn-ghost btn-small border-cyan/30 text-cyan disabled:opacity-50"
      >
        {playing ? <Pause size={14} /> : <Play size={14} />}
        <T id={playing ? "stopListening" : "listenAyah"} />
      </button>
      <button
        type="button"
        onClick={replay}
        disabled={disabled}
        aria-label={tr(lang, "replayAyah")}
        className="btn btn-ghost btn-small disabled:opacity-50"
      >
        <RotateCcw size={14} />
        <span className="hidden sm:inline"><T id="replayAyah" /></span>
      </button>
      <button
        type="button"
        onClick={toggleLoop}
        aria-pressed={loop}
        aria-label={tr(lang, "loopAyah")}
        className={`btn btn-small ${loop ? "btn-primary" : "btn-ghost"}`}
      >
        <Repeat2 size={14} />
        <span className="hidden sm:inline"><T id="loopAyah" /></span>
      </button>
      {error && (
        <span className="text-xs text-red-300" role="status">
          <T id="audioUnavailable" />
        </span>
      )}
    </div>
  );
}
