import Banner from "@/components/orbit/banner";
import RippleFilter from "@/components/orbit/banner/ripple-filter";
import { Button } from "@/components/orbit/button";
import { useRouter } from "next/navigation";
import { useSession } from "./session-provider";

export default function NavigationSigninBanner() {
  const { isLoading, session } = useSession();
  const router = useRouter();

  if (isLoading) {
    return null;
  }

  if (session) {
    return null;
  }

  return (
    <div className="flex p-3">
      <Banner
        image={"/assets/clouds.jpg"}
        filter={<RippleFilter />}
        className="ripple w-full"
        onClick={() => {
          router.push("/signin");
        }}
      >
        <div className="absolute top-0 right-0 bottom-0 left-0 z-5 bg-white opacity-25"></div>

        <div className="absolute top-2 left-3 z-15 w-[200px] text-left text-sm text-black">
          <h2 className="text-lg font-semibold">Unlock Full Potential</h2>
          <p className="mb-2">
            Outerbase Cloud gives you AI-driver insights, managed database, and
            team collaboation.
          </p>

          <Button size="sm">Sign In</Button>
        </div>

        <div className="ease-bounce absolute right-5 bottom-5 z-10 transition-transform duration-300 group-hover:-translate-3 group-hover:scale-105">
          <img
            src={"/assets/sat.png"}
            width={50}
            height={50}
            className="float"
            alt="img"
          />
        </div>
      </Banner>
    </div>
  );
}
