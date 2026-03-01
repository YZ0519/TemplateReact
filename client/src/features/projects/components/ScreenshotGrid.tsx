import { useState } from "react";
import type { ProjectScreenshot } from "../../../lib/types";
import ScreenshotLightbox from "./ScreenshotLightbox";

type Props = {
  screenshots: ProjectScreenshot[];
  projectTitle: string;
};

export default function ScreenshotGrid({ screenshots, projectTitle }: Props) {
  const [activeScreenshot, setActiveScreenshot] =
    useState<ProjectScreenshot | null>(null);

  if (screenshots.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {screenshots.map((screenshot) => (
          <button
            key={screenshot.id}
            onClick={() => setActiveScreenshot(screenshot)}
            className="block w-full focus:outline-none focus:ring-2 focus:ring-[#20a7ac] rounded-lg"
            aria-label={
              screenshot.caption
                ? `View ${screenshot.caption}`
                : `View screenshot`
            }
          >
            <img
              src={screenshot.url}
              alt={
                screenshot.caption
                  ? `${projectTitle} — ${screenshot.caption}`
                  : projectTitle
              }
              loading="lazy"
              className="rounded-lg object-contain w-full aspect-video cursor-pointer hover:opacity-90 transition-opacity bg-gray-100"
            />
          </button>
        ))}
      </div>

      {activeScreenshot && (
        <ScreenshotLightbox
          screenshot={activeScreenshot}
          projectTitle={projectTitle}
          onClose={() => setActiveScreenshot(null)}
        />
      )}
    </>
  );
}
