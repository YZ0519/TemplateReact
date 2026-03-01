import type { ProjectScreenshot } from "../../../lib/types";

type Props = {
  screenshot: ProjectScreenshot;
  projectTitle: string;
};

export default function ScreenshotHero({ screenshot, projectTitle }: Props) {
  return (
    <div className="w-full">
      <img
        src={screenshot.url}
        alt={
          screenshot.caption
            ? `${projectTitle} — ${screenshot.caption}`
            : projectTitle
        }
        className="rounded-xl object-contain max-h-[480px] w-full bg-gray-100"
      />
    </div>
  );
}
