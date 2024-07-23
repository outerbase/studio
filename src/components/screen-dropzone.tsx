"use client";

import { useEffect } from "react";

interface Props {
  onFileDrop: (handler: FileSystemFileHandle) => void;
}

export default function ScreenDropZone({ onFileDrop }: Props) {
  useEffect(() => {
    const dropEventHandler = (e: DragEvent) => {
      e.preventDefault();

      if (!e.dataTransfer) return;
      const fileList = e.dataTransfer.items;

      if (!fileList) return;
      if (fileList.length === 0) return;

      const handler = (fileList[0] as any)
        .getAsFileSystemHandle()
        .then(onFileDrop);
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
