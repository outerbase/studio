"use client";

import { useEffect } from "react";
import Link from "next/link";

interface Props {
  onFileDrop: (file?: File, handler?: FileSystemFileHandle) => void;
}

export const unsupportFileHandlerDialogContent = {
  destructive: true,
  title: "Unsupported Browser",
  content: (
    <p className="text-sm flex flex-col gap-2">
      <p>
        Outerbase Studio SQLite client requires the{" "}
        <span className="bg-muted font-mono px-2 inline-flex">
          FileSystemHandle
        </span>{" "}
        API to function.
      </p>

      <p>
        This API is currently supported only by Chromium-based browsers, such as{" "}
        <strong>Edge, Chrome, and Brave</strong>. Learn more about it here:{" "}
        <Link
          target="_blank"
          href="https://developer.mozilla.org/en-US/docs/Web/API/FileSystemHandle"
          className="text-blue-500 underline"
        >
          FileSystemHandle API
        </Link>
        .
      </p>

      <p>
        If you&apos;re encountering this issue in Brave, note that the File
        System API is disabled by default. To enable it:
      </p>

      <ul className="list-disc list-inside">
        <li>
          Open{" "}
          <span className="bg-muted font-mono px-2 inline-flex">
            brave://flags
          </span>{" "}
          in the browser.
        </li>
        <li>Search for &quot;File System Access API.&quot;</li>
        <li>Enable the feature.</li>
        <li>
          Restart Brave after enabling the API to ensure proper functionality.
        </li>
      </ul>
    </p>
  ),
};

export default function ScreenDropZone({ onFileDrop }: Props) {
  useEffect(() => {
    const dropEventHandler = (e: DragEvent) => {
      e.preventDefault();

      if (!e.dataTransfer) return;
      const fileList = e.dataTransfer.items;

      if (!fileList) return;
      if (fileList.length === 0) return;

      try {
        (fileList[0] as any)
          .getAsFileSystemHandle()
          .then((handler: FileSystemFileHandle) => {
            onFileDrop(undefined, handler);
          });
      } catch (error) {
        const file = e.dataTransfer.files[0];
        if (!file) return;
        onFileDrop(file);
      }
    };

    const dragEventHandler = (e: DragEvent) => {
      e.preventDefault();
    };

    window.document.addEventListener("drop", dropEventHandler);
    window.document.addEventListener("dragover", dragEventHandler);
    window.document.addEventListener("dragenter", dragEventHandler);

    return () => {
      window.document.removeEventListener("dragenter", dragEventHandler);
      window.document.removeEventListener("dragover", dragEventHandler);
      window.document.removeEventListener("drop", dropEventHandler);
    };
  }, [onFileDrop]);

  return <></>;
}
