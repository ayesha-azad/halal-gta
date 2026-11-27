import React from "react";
import T from "../components/shared/T.jsx";
import CrewCard from "../components/crew/CrewCard.jsx";
import StoryCard from "../components/crew/StoryCard.jsx";

export default function Crew() {
  return (
    <div className="space-y-8">
      <header>
        <span className="eyebrow"><T id="crewEyebrow" /></span>
        <h1 className="text-3xl font-bold text-white sm:text-4xl"><T id="crewTitle" /></h1>
        <T id="crewIntro" as="p" className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400" />
      </header>

      <CrewCard />

      <div>
        <span className="eyebrow"><T id="storyEyebrow" /></span>
        <h2 className="text-2xl font-bold text-white"><T id="storyTitle" /></h2>
        <T id="storySub" as="p" className="mt-1 text-sm text-slate-400" />
        <div className="mt-5">
          <StoryCard />
        </div>
      </div>
    </div>
  );
}
