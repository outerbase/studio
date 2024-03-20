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
            <Link href="/login/github">
              <Button>Continue with Github</Button>
            </Link>
            <Link href="/login/google">
              <Button>Continue with Google</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
