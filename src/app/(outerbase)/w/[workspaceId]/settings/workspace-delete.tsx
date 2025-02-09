import { Button } from "@/components/orbit/button";

export default function WorkspaceDeleteSection() {
  return (
    <div className="mt-12 flex flex-col gap-4">
      <h2 className="font-bold">Delete workspace</h2>
      <p className="text-base">
        This will delete all Bases within this workspace. All members will lose
        access.
      </p>

      <div>
        <Button size="lg" variant="destructive">
          Delete Workspace
        </Button>
      </div>
    </div>
  );
}
