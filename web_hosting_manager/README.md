# SAFE Hosting Manager

## Install

* **Note: requires a node version 6.5.0 and an npm version 3.10.3**

First, clone the repo via git:

```bash
git clone https://github.com/maidsafe/safe_examples && cd safe_examples/web_hosting_manager
```

And then install dependencies.
Install with [yarn](https://github.com/yarnpkg/yarn) for faster and safer installation

```bash
yarn install
```

Manually build `safe_app_nodejs` dependency from `app/node_modules/safe-app`

## Run

Run these two commands __simultaneously__ in different console tabs.

```bash
$ npm run hot-server
$ npm run start-hot
```

or run two servers with one command

```bash
$ npm run dev
```

## CSS Modules

This boilerplate out of the box is configured to use [css-modules](https://github.com/css-modules/css-modules) and SASS.

All `.scss` file extensions will use css-modules unless it has `.global.scss`.

If you need global styles, stylesheets with `.global.scss` will not go through the
css-modules loader. e.g. `app.global.scss`

If you want to import global css libraries (like `bootstrap`), you can just write the following code in `.global.scss`:

```css
@import "~bootstrap/dist/css/bootstrap.css";
```

For SASS mixin
```css
@import "~bootstrap/dist/css/bootstrap.css";
```


## Packaging

Based on the platform configure `build.asarUnpack` option in package.json
```
osx : "*.dylib"
linux : "*.so"
windows: "*.dll"
```

To package apps for the local platform:

```bash
$ npm run package
```

To package apps for all platforms:

To package apps with options:

```bash
$ npm run package -- --[option]
```

## Further commands

To run the application without packaging run

```bash
$ npm run build
$ npm start
```

To run End-to-End Test

```bash
$ npm run build
$ npm run test-e2e
```

#### Module Structure

This boilerplate uses a [two package.json structure](https://github.com/electron-userland/electron-builder#two-packagejson-structure).

1. If the module is native to a platform or otherwise should be included with the published package (i.e. bcrypt, openbci), it should be listed under `dependencies` in `./app/package.json`.
2. If a module is `import`ed by another module, include it in `dependencies` in `./package.json`.   See [this ESLint rule](https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/no-extraneous-dependencies.md).
3. Otherwise, modules used for building, testing and debugging should be included in `devDependencies` in `./package.json`.
