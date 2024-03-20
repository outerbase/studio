import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex h-screen w-screen justify-center items-center">
      <div className="w-[300px]">
        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold">Sign In</h2>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Button asChild>
              <Link href="/login/github">Continue with Github</Link>
            </Button>
            <Button asChild>
              <Link href="/login/google">Continue with Google</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
