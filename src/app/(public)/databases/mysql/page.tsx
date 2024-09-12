import { MySQLIcon } from "@/components/icons/outerbase-icon";
import WebsiteLayout from "@/components/website-layout";
import { Metadata } from "next";

const siteDescription =
  "LibSQL Studio is a fully-featured, lightweight GUI client for managing MySQL databases";

export const metadata: Metadata = {
  title: "MySQL - LibSQL Studio",
  keywords: ["mysql", "studio", "browser", "editor", "gui", "online", "client"],
  description: siteDescription,
  openGraph: {
    siteName: "LibSQL Studio",
    description: siteDescription,
  },
};

function HeroSection() {
  return (
    <div className="mt-32 relative h-[428px]">
      <div
        className="absolute top-0 bottom-0 left-0 right-0 transform-gpu before:absolute before:top-0 before:z-10 before:h-32 before:w-full before:bg-gradient-to-b before:from-black before:to-black/0 after:absolute after:bottom-0 after:left-0 after:h-full after:w-full after:bg-gradient-to-t after:from-black after:to-black/0"
        style={{
          background: `url(/hero-banner.jpg)`,
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      ></div>

      <div className="absolute top-0 bottom-0 left-0 right-0 -mt-16">
        <div className="mx-auto container">
          <h2 className="text-4xl flex  gap-4  items-center font-bold text-white">
            <MySQLIcon />
            <span>MySQL Support</span>
          </h2>
          <p className="max-w-[700px] mt-6 text-lg">
            LibSQL Studio is a lightweight, fully-featured GUI client for MySQL
            databases. It enables you to manage and view your database, or
            expose your database interface externally and much more.
          </p>
        </div>
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
          Connecting
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
