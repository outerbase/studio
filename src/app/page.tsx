import Link from "next/link";
import Script from "next/script";

function Topbar() {
  return (
    <header className="border-b">
      <div className="mx-auto container flex">
        <h1 className="text-lg p-2">
          LibSQL <strong>Studio</strong>
        </h1>
        <div className="grow" />
        <div className="flex items-center pt-1">
          <a
            className="github-button"
            href="https://github.com/invisal/libsql-studio"
            data-color-scheme="no-preference: light; light: light; dark: dark;"
            data-size="large"
            data-show-count="true"
            aria-label="Star invisal/libsql-studio on GitHub"
          >
            Star
          </a>
        </div>
      </div>
    </header>
  );
}

function LinkButton({ title, url }: Readonly<{ title: string; url: string }>) {
  return (
    <Link
      href={url}
      className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-700 text-center"
    >
      {title}
    </Link>
  );
}

function Footer() {
  return (
    <div className="mt-12 border-t py-4">
      <div className="mx-auto container">© 2024 Visal .In. | LibSQL Studio</div>
    </div>
  );
}

function Screenshot() {
  return (
    <div className="my-2 mx-4">
      <div className="max-w-[800px] mx-auto border-2 border-gray-200 bg-gray-200 rounded-lg overflow-hidden">
        <div className="h-6 flex items-center">
          <div className="grow" />
          <div className="px-2 flex gap-1">
            <div className="rounded-full h-3 w-3 bg-red-500" />
            <div className="rounded-full h-3 w-3 bg-yellow-400" />
            <div className="rounded-full h-3 w-3 bg-green-600" />
          </div>
        </div>
        <img
          src="/screenshot2.png"
          className="w-full"
          alt="LibSQL Studio Powerful Browser Database GUI"
          style={{ aspectRatio: 1134 / 649 }}
        />
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <div className="mx-auto container py-16">
      <h2 className="text-center text-4xl font-bold">
        Manage database from browser
      </h2>

      <p className="text-center max-w-[500px] mx-auto mt-6 text-lg">
        LibSQL Studio is powerful and lightweight libSQL and Sqlite client that
        run from your browser. Cross platform and no download needed.
      </p>

      <div className="flex flex-col gap-4 justify-center mt-8 md:flex-row">
        <LinkButton title="Connect to LibSQL" url="/connect" />
        <LinkButton title="Open Sqlite Database" url="#" />
      </div>
    </div>
  );
}

export default function MainPage() {
  return (
    <main>
      <Script async defer src="https://buttons.github.io/buttons.js" />
      <Topbar />
      <HeroSection />
      <Screenshot />
      <Footer />
    </main>
  );
}
