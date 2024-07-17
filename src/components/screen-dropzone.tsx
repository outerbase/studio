"use client";

import { useEffect } from "react";

interface Props {
  onFileDrop: (buffer: ArrayBuffer) => void;
}

export default function ScreenDropZone({ onFileDrop }: Props) {
  useEffect(() => {
    const dropEventHandler = (e: DragEvent) => {
      if (!e.dataTransfer) return;
      const file = e.dataTransfer.files[0];

      if (!file) return;
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        onFileDrop(loadEvent.target?.result as ArrayBuffer);
      };

      reader.readAsArrayBuffer(file);
    };

    window.document.addEventListener("drop", dropEventHandler);

    return () => {
      window.document.removeEventListener("drop", dropEventHandler);
    };
  }, [onFileDrop]);

  return <></>;
}
