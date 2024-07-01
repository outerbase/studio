/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require("fs");
const path = require("path");
const showdown = require("showdown");

function build_dialect(dialectName) {
  const dialectFolder = path.join(__dirname, "src", "drivers", dialectName);
  const functionFolder = path.join(dialectFolder, "functions");
  const functionFiles = fs.readdirSync(functionFolder);

  const functions = {};

  const mdConverter = new showdown.Converter({ tables: true });
  for (const functionFile of functionFiles) {
    const mdContent = fs
      .readFileSync(path.join(functionFolder, functionFile))
      .toString();

    const mdContentLines = mdContent.split("\n");

    functions[path.parse(functionFile).name] = {
      syntax: mdContentLines[0],
      description: mdConverter.makeHtml(mdContentLines.slice(2).join("\n")),
    };
  }

  fs.writeFileSync(
    path.join(dialectFolder, "function-tooltip.json"),
    JSON.stringify(functions, undefined, 2)
  );
}

build_dialect("sqlite");
