"use client";
import { Button } from "@/components/orbit/button";
import { Plus } from "@phosphor-icons/react";

export default function WorkspaceMemberSection() {
  return (
    <div className="mt-12 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold">Members</h2>
        <Button size="lg">
          <Plus size={16} />
          New Member
        </Button>
      </div>
    </div>
  );
}
