"use client";

import { useEffect } from "react";
import { useCommonDialog } from "./common-dialog";

interface Props {
  onFileDrop: (handler: FileSystemFileHandle) => void;
}

export default function ScreenDropZone({ onFileDrop }: Props) {
  const { showDialog } = useCommonDialog();

  useEffect(() => {
    const dropEventHandler = (e: DragEvent) => {
      e.preventDefault();

      if (!e.dataTransfer) return;
      const fileList = e.dataTransfer.items;

      if (!fileList) return;
      if (fileList.length === 0) return;

      try {
        (fileList[0] as any).getAsFileSystemHandle().then(onFileDrop);
      } catch (error) {
        showDialog({
          destructive: true,
          title: "Warning",
          content: "Your browser are not support. please use another browser.",
        });
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
  }, [onFileDrop, showDialog]);

  return <></>;
}
