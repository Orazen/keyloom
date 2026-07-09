"use client";
import { AbsoluteFill } from "remotion";
import { SmartVideo } from "../../smart-video";

export type SplitStackProps = {
  userSrc: string;
  gameSrc: string;
  /** Height fraction of the user's panel (0.3–0.7). */
  split?: number;
  userOnTop?: boolean;
};

export const SplitStack: React.FC<SplitStackProps> = ({
  userSrc,
  gameSrc,
  split = 0.5,
  userOnTop = true,
}) => {
  const userPanel = (
    <div key="user" style={{ height: `${split * 100}%`, overflow: "hidden" }}>
      <SmartVideo
        src={userSrc}
        objectFit="cover"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
  const gamePanel = (
    <div
      key="game"
      style={{ height: `${(1 - split) * 100}%`, overflow: "hidden" }}
    >
      <SmartVideo
        src={gameSrc}
        muted
        loop
        objectFit="cover"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {userOnTop ? [userPanel, gamePanel] : [gamePanel, userPanel]}
    </AbsoluteFill>
  );
};
