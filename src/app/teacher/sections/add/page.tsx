"use client";
import { Suspense } from "react";
import AddSectionContent from "./AddSectionContent";

export default function AddSectionPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-center text-gray-500">جاري التحميل...</div>
      }
    >
      <AddSectionContent />
    </Suspense>
  );
}
