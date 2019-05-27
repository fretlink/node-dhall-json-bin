# node-dhall-json-bin
NPM package for `dhall-json`, based on https://github.com/justinwoo/npm-psc-package-bin-simple. Linux and Windows only.

## Installation

:warning: This package should be installed as an optional dependency until static macOS builds are available from [`dhall-haskell` releases](https://github.com/dhall-lang/dhall-haskell/releases).

There’s two installation modes:

### Locked

```
npm install --save-optional fretlink/node-dhall-json-bin#v<dhall-json version>-<dhall version>-<package version>
```

This will install a specific version of `dhall-json`. Replace `<dhall-json version>`, `<dhall version>` and `<package version>` with appropriate versions of `dhall-json`, `dhall` and this package.

See [the releases](https://github.com/fretlink/node-dhall-json-bin/releases).

### Dynamic

```
npm install --save-optional fretlink/node-dhall-json-bin
```

This will install a version of `dhall-json` matching the `DHALL_JSON_VERSION` and `DHALL_VERSION` environment variables or the `dhall-json:dhall-json-version` and `dhall-json:dhall-version` [npm configuration settings](https://docs.npmjs.com/misc/config#per-package-config-settings).
