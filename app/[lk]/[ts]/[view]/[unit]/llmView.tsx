"use client";

import Peer from "components/peer";
import { useEffect, useState } from "react";
import getLLMResponse from "./llmViewAction";

export function Pending() {
  return (
    <div className="flex flex-col items-stretch">
      <div className="grid grid-cols-[auto,1fr] pt-4">
        <div className="text-[32px] pr-1">😊</div>
        <div>
          <div>...</div>
        </div>
      </div>
    </div>
  );
}

export default function Component({
  params: { lk, ts, view, unit, initialAgents },
}: {
  params: { lk: string; ts: string; view: string; unit: string; initialAgents: { amy: string } };
}) {
  const [agents, setAgents] = useState<any>(initialAgents);
  useEffect(() => {
    if (agents.amy !== "") {
      return;
    }
    getLLMResponse(lk, ts, view, unit).then((x) => {
      setAgents(x.agents);
    });
  }, [lk, ts, view, unit, agents.amy]);

  return (
    <div className="relative">
      <Peer id="test" target={`/${lk}/${ts}/${view}/${unit}`} delay={0} />
      <div className="peer-checked/test:invisible">
        <div className="flex flex-col items-stretch">
          <div className="grid grid-cols-[auto,1fr] pt-4">
            <div className="text-[32px] pr-1">😊</div>
            <div>
              <div>{agents.amy === "" ? "..." : agents.amy}</div>
            </div>
          </div>
        </div>
      </div>
      <Peer id="test2" target={`/${lk}/${ts}/${view}/${unit}`} delay={750} />
      <div className="absolute left-1 top-0 w-full h-full hidden peer-checked/test2:block">
        <Pending />
      </div>
    </div>
  );
}
