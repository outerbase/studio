import { Button } from "@/components/ui/button";
import { FileImage } from "@phosphor-icons/react";
import { getNodesBounds, getViewportForBounds, useReactFlow } from "@xyflow/react";
import { toPng } from 'html-to-image';

function downloadImage(dataUrl: string) {
  const a = document.createElement('a');

  a.setAttribute('download', 'outerbase_relationship_diagram.png');
  a.setAttribute('href', dataUrl);
  a.click();
}

const imageWidth = 1024;
const imageHeight = 768;

export function DownloadImageDiagram() {
  const { getNodes } = useReactFlow();

  const onClick = () => {
    const nodesBounds = getNodesBounds(getNodes());

    const viewport = getViewportForBounds(
      nodesBounds,
      imageWidth,
      imageHeight,
      0.5,
      2,
      0
    );

    const doc: any = document.querySelector('.react-flow__viewport');

    if (doc) {
      toPng(doc, {
        backgroundColor: '#1a365d',
        width: imageWidth,
        height: imageHeight,
        style: {
          width: String(imageWidth),
          height: String(imageHeight),
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
        }
      }).then(downloadImage)
    }
  }

  return (
    <Button
      variant={"ghost"}
      size={"sm"}
      onClick={onClick}
      className="download-btn"
    >
      <FileImage size={15} />
    </Button>
  )
}