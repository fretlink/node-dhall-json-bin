"use strict";

const fs = require("fs");
const path = require("path");

const { https } = require("follow-redirects");
const tar = require("tar");
const unbz2 = require("unbzip2-stream");
const unzipper = require("unzipper");

const pkg = require("./package.json");
const bindir = path.join(__dirname, "bin");

const trim = str => str && String(str).trim();

const dhallVersion = trim(pkg["dhall-version"] || process.env.DHALL_VERSION);
if (!dhallVersion) throw new Error("Missing DHALL_VERSION environment variable.");

const dhallJsonVersion = trim(pkg["dhall-json-version"] || process.env.DHALL_JSON_VERSION);
if (!dhallJsonVersion) throw new Error("Missing DHALL_JSON_VERSION environment variable.");

const release = `https://github.com/dhall-lang/dhall-haskell/releases/download/${dhallVersion}/dhall-json-${dhallJsonVersion}`;

const get = (archive, callback) => {
  const url = `${release}-${archive}`;
  return https.get(url, res => {
    if (res.statusCode >= 400) throw new Error(`Error fetching ${url}: ${res.statusMessage}`);
    return callback(res);
  });
};

if (process.platform === "win32") {
  get("x86_64-windows.zip", res =>
    res.pipe(unzipper.Extract({ path: bindir }))
  );
} else {
  get("x86_64-linux.tar.bz2", res =>
    res.pipe(unbz2()).pipe(tar.x({ C: __dirname }).on("finish", () => {
      fs.readdir(bindir, (err, names) => {
        if (err) throw err;
        for (const name of names) {
          fs.rename(path.join(bindir, name), path.join(bindir, name + ".exe"), err => {
            if (err) throw err;
          });
        }
      });
    }))
  );
}
