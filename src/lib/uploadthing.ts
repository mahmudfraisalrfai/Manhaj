// lib/uploadthing.ts
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { generateReactHelpers } from "@uploadthing/react";

const f = createUploadthing();

export const ourFileRouter = {
  sectionIcon: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      return { userId: "user" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return {
        uploadedBy: metadata.userId,
        url: file.url,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

// إنشاء الـ helpers هنا مباشرة
export const { useUploadThing, uploadFiles } =
  generateReactHelpers<OurFileRouter>();
