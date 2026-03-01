import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import type { ProjectScreenshot } from "../../../lib/types";

type Props = {
  screenshot: ProjectScreenshot;
  projectTitle: string;
  onClose: () => void;
};

export default function ScreenshotLightbox({
  screenshot,
  projectTitle,
  onClose,
}: Props) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const altText = screenshot.caption
    ? `${projectTitle} — ${screenshot.caption}`
    : projectTitle;

  return (
    <div
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={altText}
      onClick={handleBackdropClick}
    >
      <button
        ref={closeButtonRef}
        onClick={onClose}
        aria-label="Close lightbox"
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-white rounded"
      >
        <X size={32} />
      </button>
      <div className="max-w-[90vw] max-h-[90vh] flex flex-col items-center gap-3">
        <img
          src={screenshot.url}
          alt={altText}
          className="max-w-full max-h-[80vh] object-contain rounded-lg"
        />
        {screenshot.caption && (
          <p className="text-gray-300 text-sm text-center">{screenshot.caption}</p>
        )}
      </div>
    </div>
  );
}
