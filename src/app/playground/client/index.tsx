import PlaygroundEditorBody from "@/app/(theme)/playground/client/page-client";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/playground/client/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <PlaygroundEditorBody />;
}
