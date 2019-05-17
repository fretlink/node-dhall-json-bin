"use strict";

const { https } = require("follow-redirects");
const tar = require("tar");
const unbz2 = require("unbzip2-stream");

const pkg = require("./package.json");

const trim = str => str && String(str).trim();

const dhallVersion = trim(pkg["dhall-version"] || process.env.DHALL_VERSION);
if (!dhallVersion) throw new Error("Missing DHALL_VERSION environment variable.");

const dhallJsonVersion = trim(pkg["dhall-json-version"] || process.env.DHALL_JSON_VERSION);
if (!dhallJsonVersion) throw new Error("Missing DHALL_JSON_VERSION environment variable.");

const release = `https://github.com/dhall-lang/dhall-haskell/releases/download/${dhallVersion}/dhall-json-${dhallJsonVersion}`;

const url = `${release}-x86_64-linux.tar.bz2`;
https.get(url, res => {
  if (res.statusCode >= 400) throw new Error(`Error fetching ${url}: ${res.statusMessage}`);
  res.pipe(unbz2()).pipe(tar.x({ C: __dirname }));
});
