"use client";

import PrimitiveAnimation from "~/components/primitive.animation";
import EarthAnimation from "~/components/earth.animation";
import { useMemo, useState } from "react";
import WormholeAnimation from "~/components/wormhole.animation";

enum Mode {
  Primitive = "Primitive",
  Earth = "Earth",
  Wormhole = "Wormhole",
}

export default function HomePage() {
  const [mode, setMode] = useState<Mode>(Mode.Wormhole);
  const renderAnimation = useMemo(() => {
    switch (mode) {
      case Mode.Primitive:
        return <PrimitiveAnimation />;
      case Mode.Earth:
        return <EarthAnimation />;
      case Mode.Wormhole:
        return <WormholeAnimation />;
      default:
        return null;
    }
  }, [mode]);

  function handleChangeMode(newMode: Mode) {
    if (newMode !== mode) setMode(newMode);
  }

  return (
    <>
      <div
        className={
          "absolute inset-x-0 bottom-0 mx-auto size-fit rounded-t-2xl bg-white/55 p-3 backdrop-blur-xl"
        }
      >
        {Object.values(Mode)
          .filter((key) => isNaN(Number(key)))
          .map((m) => (
            <button
              type={"button"}
              onClick={() => handleChangeMode(Mode[m])}
              className={"mx-1 rounded-full bg-white px-5 py-2 drop-shadow"}
            >
              {m}
            </button>
          ))}
      </div>

      {renderAnimation}
    </>
  );
}
