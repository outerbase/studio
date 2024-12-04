import { MySQLIcon } from "@/components/icons/outerbase-icon";
import WebsiteLayout from "@/components/website-layout";
import { WEBSITE_NAME } from "@/const";
import { Metadata } from "next";
import Link from "next/link";

const siteDescription = `${WEBSITE_NAME} is a fully-featured, lightweight GUI client for managing MySQL databases`;

export const metadata: Metadata = {
  title: `MySQL - ${WEBSITE_NAME}`,
  keywords: ["mysql", "studio", "browser", "editor", "gui", "online", "client"],
  description: siteDescription,
  openGraph: {
    siteName: WEBSITE_NAME,
    description: siteDescription,
  },
};

function HeroSection() {
  return (
    <div className="mt-24 relative">
      <div className="mx-auto max-w-[800px] p-2">
        <h2 className="text-4xl flex gap-4 justify-center items-center font-bold text-white">
          <MySQLIcon />
          <span>MySQL Support</span>
        </h2>

        <p className="mt-6 text-lg text-center">
          {WEBSITE_NAME} is a lightweight GUI client for MySQL databases. It
          enables you to manage and view your database, or expose your database
          interface externally and much more. You can download desktop app or
          run it from your command line.
        </p>

        <p className="my-12 text-center">
          <Link
            className="bg-primary text-primary-foreground px-4 py-4 font-bold rounded-lg"
            href="https://github.com/outerbase/studio-desktop/releases"
          >
            Download Mac and Windows
          </Link>
        </p>

        <video muted autoPlay loop className="lg:rounded-lg" playsInline>
          <source
            src="https://r2.invisal.com/libsqlstudio-mysql.mp4"
            type="video/mp4"
          />
        </video>
      </div>
    </div>
  );
}

export default function DatabaseMySqlPage() {
  return (
    <WebsiteLayout>
      <HeroSection />

      <div className="container mx-auto my-24">
        <h2 className="text-2xl flex  gap-4  items-center font-bold text-white mb-4">
          Connecting via Command Line
        </h2>

        <p>
          You can connect to your MySQL database using our command line
          interface.
        </p>

        <pre className="my-4 p-4 border-2 bg-zinc-900 text-white rounded">
          <div>
            &gt;&nbsp;npx{" "}
            <span className="text-yellow-500 mr-2">@outerbase/studio</span>
            <span className="text-green-500">
              mysql://root:123@localhost:3306/chinook
            </span>
          </div>
          <div className="border-double border-4 border-gray-400 border-white inline-block mt-4 text-gray-400">
            <div>{"                                              "}</div>
            <div>{"    Serving!                                  "}</div>
            <div>{"    - Local:    http://localhost:4000         "}</div>
            <div>{"    - Network:  http://xxx.xxx.xxx.xxx:4000    "}</div>
            <div>{"                                              "}</div>
          </div>
        </pre>

        <p>
          You can also configure the port and secure it with authentication.
        </p>

        <pre className="my-4 p-4 border-2 bg-zinc-900 text-white rounded">
          <div>
            <div>
              &gt;&nbsp;npx{" "}
              <span className="text-yellow-500 mr-2">@outerbase/studio</span> \
            </div>
            <div className="ml-8">--port=5000 \</div>
            <div className="ml-8">--user=admin --pass=123 \</div>
            <div className="ml-8">
              <span className="text-green-500">
                mysql://root:123@localhost:3306/chinook
              </span>
            </div>
          </div>
        </pre>

        <h2 className="text-2xl flex gap-4 items-center font-bold text-white my-4 mt-12">
          Configuration File
        </h2>

        <p>
          Tired of typing long connection strings repeatedly? Simply save the
          configuration to a file and use it whenever needed. Create{" "}
          <span className="font-mono text-white">outerbase.json</span>
        </p>

        <pre className="my-4 p-4 border-2 bg-zinc-900 text-white rounded">
          {`{
  "driver": "mysql",
  "connection": {
    "database": "chinook",
    "host": "localhost",
    "port": 3306,
    "user": "root",
    "password": "123456"
  }
}
`}
        </pre>

        <p>
          Next, run our command line tool to start the service. By default, it
          will search for the{" "}
          <span className="font-mono text-white">outerbase.json</span>{" "}
          configuration file. Alternatively, you can specify a custom
          configuration using the{" "}
          <span className="font-mono text-white">--config</span> flag.
        </p>

        <pre className="my-4 p-4 border-2 bg-zinc-900 text-white rounded">
          <div>
            &gt;&nbsp;npx{" "}
            <span className="text-yellow-500 mr-2">@outerbase/studio</span>
          </div>
        </pre>
      </div>
    </WebsiteLayout>
  );
}
