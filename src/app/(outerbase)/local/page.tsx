"use client";
import { useRouter } from "next/navigation";

export default function LocalConnectionPage() {
  // Redirect to root
  const router = useRouter();
  router.push("/");

  return <div />;
}
