import { Upload } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import Cropper, { type ReactCropperElement } from "react-cropper";
import "cropperjs/dist/cropper.css";

type Props = {
  uploadPhoto: (file: Blob) => void;
  loading: boolean;
};

export default function PhotoUploadWidget({ uploadPhoto, loading }: Props) {
  const [files, setFiles] = useState<(File & { preview: string })[]>([]);
  const cropperRef = useRef<ReactCropperElement>(null);

  useEffect(() => {
    return () => {
      files.forEach((file) => URL.revokeObjectURL(file.preview));
    };
  }, [files]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(
      acceptedFiles.map((file) =>
        Object.assign(file, { preview: URL.createObjectURL(file) }),
      ),
    );
  }, []);

  const onCrop = useCallback(() => {
    const cropper = cropperRef.current?.cropper;
    cropper?.getCroppedCanvas().toBlob((blob) => {
      if (blob) uploadPhoto(blob);
    });
  }, [uploadPhoto]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div className="grid grid-cols-3 gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
          Step 1 — Add photo
        </p>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg h-64 flex flex-col items-center justify-center cursor-pointer transition-colors
            ${isDragActive ? "border-green-500 bg-green-50" : "border-gray-300 hover:border-gray-400"}`}
        >
          <input {...getInputProps()} />
          <Upload size={48} className="text-gray-400 mb-2" />
          <p className="text-gray-500">Drop image here</p>
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
          Step 2 — Resize image
        </p>
        {files[0]?.preview && (
          <Cropper
            src={files[0].preview}
            style={{ height: 256, width: "100%" }}
            initialAspectRatio={1}
            aspectRatio={1}
            preview=".img-preview"
            guides={false}
            viewMode={1}
            background={false}
            ref={cropperRef}
          />
        )}
      </div>
      <div>
        {files[0]?.preview && (
          <>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
              Step 3 — Preview & Upload
            </p>
            <div className="img-preview w-full h-56 overflow-hidden rounded mb-3" />
            <button
              onClick={onCrop}
              disabled={loading}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "Uploading..." : "Upload"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
