"use strict";

const fs = require("fs");
const path = require("path");

const { https } = require("follow-redirects");
const semver = require("semver");
const tar = require("tar");
const unbz2 = require("unbzip2-stream");
const unzipper = require("unzipper");

const pkg = require("./package.json");
const bindir = path.join(__dirname, "bin");

const formatVersionKey = name =>
  `${name}-version`;
const toSnakeCase = name =>
  name.replace(/-/g, '_');
const formatNpmCfgVar = name =>
  toSnakeCase(name.toLowerCase());
const formatEnvVar = name =>
  toSnakeCase(name.toUpperCase());
const prefixNpmCfgKey = key =>
  `${pkg.name}:${key}`;

const readVersionWith = (lookup, discard = () => {}) => name => {
  const key = formatVersionKey(name);
  const version = lookup(key);
  return version ? {
    get version() { return String(version).trim() },
    discard() { discard(key, version) },
    orElse(alt) { alt.discard(); return this }
  } : {
    get version() {
      throw new Error(`Missing \`${name}\` version! You can provide it as a \`${prefixNpmCfgKey(key)}\` npm configuration parameter or as a \`${formatEnvVar(key)}\` environment variable.`);
    },
    discard() {},
    orElse(alt) { return alt }
  };
};

const readPkgVersion = readVersionWith(key => pkg[key]);
const readCfgVersion = readVersionWith(key => {
  return process.env[`npm_config_${formatNpmCfgVar(pkg.name)}_${formatNpmCfgVar(key)}`];
}, (key, version) => {
  console.warn(`Ignoring \`${prefixNpmCfgKey(key)}\` npm configuration parameter (${version}).`);
});
const readEnvVersion = readVersionWith(key => {
  return process.env[formatEnvVar(key)];
}, (key, version) => {
  console.warn(`Ignoring \`${formatEnvVar(key)}\` environment variable (${version}).`);
});

const readVersion = name =>
  readPkgVersion(name)
    .orElse(readEnvVersion(name))
    .orElse(readCfgVersion(name))
    .version;

const dhallVersion = readVersion("dhall");
const dhallJsonVersion = readVersion("dhall-json");
if (semver.valid(dhallJsonVersion) && semver.lt(dhallJsonVersion, "1.2.8")) {
  throw new Error(`This release of the \`${pkg.name}\` npm package installs \`json-to-dhall\`, which isn’t provided by \`dhall-json@<1.2.8\`.`);
}

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
