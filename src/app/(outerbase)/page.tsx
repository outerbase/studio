"use client";

import NavigationLayout from "./nav-layout";
import RecentResource from "./recent-page";

export default function OuterbaseMainPage() {
  return (
    <NavigationLayout>
      <RecentResource />
    </NavigationLayout>
  );
}
