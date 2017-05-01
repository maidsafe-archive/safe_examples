# Safe Mail Tutorial Application

The tutorial app show cases how to use the low level API from launcher to
build a simple email application.

Demonstrates the usage of
 - Private AppendableData
 - StructuredData
 - Immutable data

Requires [safe_launcher](https://github.com/maidsafe/safe_launcher) version 0.9.1

## Install

First, clone the repo and then install dependencies.

```bash
$ cd your-project-name && npm install
```

## Run

```bash
$ npm start
```

This starts the app in development mode with hot-reloading.

### Faking Authentication

If you don't have authenticator set up and want to run the test with randomly generated testing credentials, run it as:

```bash
$ NODE_ENV=development SAFE_FAKE_AUTH=1 npm start
```

*Note: requires a node version >= 4 and an npm version >= 2.*

## DevTools

#### Toggle Chrome DevTools

- OS X: <kbd>Cmd</kbd> <kbd>Alt</kbd> <kbd>I</kbd> or <kbd>F12</kbd>
- Linux: <kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>I</kbd> or <kbd>F12</kbd>
- Windows: <kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>I</kbd> or <kbd>F12</kbd>

*See [electron-debug](https://github.com/sindresorhus/electron-debug) for more information.*


## Package

```bash
$ npm run package
```

To package apps for all platforms:

```bash
$ npm run package-all
```

To package apps with options:

```bash
$ npm run package -- --[option]
```

## Application Data Model

The following diagram depicts how the emails are stored in the SAFE network, as well as how the email app stores email accounts information.

![Email App Data Model](./design/EmailApp-DataModel.png)
