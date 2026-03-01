import { useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import StyledButton from "../../../app/shared/components/StyledButton";
import {
  useAddScreenshot,
  useRemoveScreenshot,
} from "../../../lib/hooks/useProjects";
import type { ProjectScreenshot } from "../../../lib/types";

type Props = {
  projectId: string;
  screenshots: ProjectScreenshot[];
};

export default function ScreenshotUploadForm({
  projectId,
  screenshots,
}: Props) {
  const { addScreenshot } = useAddScreenshot(projectId);
  const { removeScreenshot } = useRemoveScreenshot(projectId);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [caption, setCaption] = useState("");
  const [displayOrder, setDisplayOrder] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const sorted = [...screenshots].sort(
    (a, b) => a.displayOrder - b.displayOrder,
  );
  const heroId = sorted[0]?.id;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    await addScreenshot.mutateAsync({
      file: selectedFile,
      caption: caption || undefined,
      displayOrder,
    });
    setSelectedFile(null);
    setCaption("");
    setDisplayOrder(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-900">Screenshots</h3>

      {sorted.length > 0 ? (
        <ul className="space-y-3">
          {sorted.map((screenshot) => (
            <li
              key={screenshot.id}
              className="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3"
            >
              <img
                src={screenshot.url}
                alt={screenshot.caption ?? "Screenshot"}
                className="w-20 h-14 object-cover rounded"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-gray-900 text-sm truncate">
                    {screenshot.caption ?? "No caption"}
                  </span>
                  {screenshot.id === heroId && (
                    <span className="text-xs bg-[#182a73]/10 text-[#182a73] border border-[#182a73]/30 rounded-full px-2 py-0.5 flex-shrink-0">
                      Hero
                    </span>
                  )}
                </div>
                <span className="text-gray-500 text-xs">
                  Order: {screenshot.displayOrder}
                </span>
              </div>
              <button
                onClick={() => removeScreenshot.mutate(screenshot.id)}
                disabled={removeScreenshot.isPending}
                aria-label={`Delete screenshot${screenshot.caption ? `: ${screenshot.caption}` : ""}`}
                className="text-red-400 hover:text-red-300 disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 rounded flex-shrink-0"
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 text-sm">No screenshots uploaded yet.</p>
      )}

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
        <p className="text-sm font-medium text-gray-700">Upload new screenshot</p>

        <div>
          <label
            htmlFor="screenshot-file"
            className="text-sm font-medium text-gray-600 block mb-1"
          >
            File (max 5MB)
          </label>
          <input
            id="screenshot-file"
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="text-sm text-gray-700 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-[#182a73] file:text-white hover:file:bg-[#182a73]/80 file:cursor-pointer focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="screenshot-caption"
              className="text-sm font-medium text-gray-600"
            >
              Caption (optional)
            </label>
            <input
              id="screenshot-caption"
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="e.g. Dashboard overview"
              className="border border-gray-300 bg-white rounded px-3 py-2 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#218aac]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="screenshot-order"
              className="text-sm font-medium text-gray-600"
            >
              Display Order
            </label>
            <input
              id="screenshot-order"
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(Number(e.target.value))}
              className="border border-gray-300 bg-white rounded px-3 py-2 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#218aac]"
            />
          </div>
        </div>

        <StyledButton
          onClick={handleUpload}
          disabled={!selectedFile}
          loading={addScreenshot.isPending}
          variant="outlined"
          size="small"
        >
          Upload Screenshot
        </StyledButton>
      </div>
    </div>
  );
}
