// components/ui/upload-button.tsx
"use client";

import { useUploadThing } from "@/lib/uploadthing";
import { useState } from "react";
import { UploadIcon } from "./Icon";

interface UploadButtonProps {
  onUploadComplete: (url: string) => void;
  onUploadError: (error: Error) => void;
}

export function UploadButton({
  onUploadComplete,
  onUploadError,
}: UploadButtonProps) {
  const [isUploading, setIsUploading] = useState(false);

  const { startUpload } = useUploadThing("sectionIcon", {
    onClientUploadComplete: (res) => {
      setIsUploading(false);
      if (res && res[0]) {
        onUploadComplete(res[0].url);
      }
    },
    onUploadError: (error) => {
      setIsUploading(false);
      onUploadError(new Error(error.message));
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // التحقق من نوع الملف
    if (!file.type.startsWith("image/")) {
      onUploadError(new Error("الرجاء اختيار ملف صورة فقط"));
      return;
    }

    // التحقق من حجم الملف
    if (file.size > 4 * 1024 * 1024) {
      onUploadError(new Error("حجم الملف يجب أن يكون أقل من 4MB"));
      return;
    }

    setIsUploading(true);
    startUpload([file]);
  };

  return (
    <div className="flex items-center gap-2">
      <input
        id="icon-upload"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
        disabled={isUploading}
      />
      <label
        htmlFor="icon-upload"
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium cursor-pointer transition-all duration-200 ${
          isUploading
            ? "bg-gray-400 text-white cursor-not-allowed"
            : "bg-blue-500 text-white hover:bg-blue-600"
        }`}
      >
        <UploadIcon className="w-4 h-4" />
        {isUploading ? "جاري الرفع..." : "رفع أيقونة"}
      </label>
    </div>
  );
}
