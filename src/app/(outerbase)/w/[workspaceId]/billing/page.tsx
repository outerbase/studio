"use client";
import NavigationHeader from "@/app/(outerbase)/nav-header";
import NavigationLayout from "@/app/(outerbase)/nav-layout";

export const runtime = "edge";

export default function WorkspaceBillingPage() {
  return (
    <NavigationLayout>
      <NavigationHeader />
      <div className="container mt-10 flex flex-col p-4">
        <h1 className="text-lg font-bold">Billing</h1>
      </div>
    </NavigationLayout>
  );
}
