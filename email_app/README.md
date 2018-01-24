# Safe Mail Tutorial Application

The tutorial app show cases how to use the low level API from `safe_app_nodejs`
library to build a simple email application.

Demonstrates the usage of:
 - Private MutableData
 - Public MutableData
 - Immutable data
 - App's own container
 - `_publicNames` and services containers

Please refer to the [Application Data Model](#application-data-model) section below for additional details.

## Install

First, clone the repository:

```bash
$ cd your-project-name
```

And then install the dependencies:

```bash
$ npm install
```

If you are working on a development environment, you can run the command below instead, in order to get the `safe_client` libraries that use the `MockVault` file rather than connecting to the SAFE Network:

```bash
$ NODE_ENV=dev npm install
```

## Run

```bash
$ npm start
```

This starts the app in development mode with hot-reloading.

### Faking Authentication

If you don't have authenticator set up and want to run the test with randomly generated testing credentials, run it as:

```bash
$ NODE_ENV=dev SAFE_FAKE_AUTH=1 npm start
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

## Test

```bash
npm run test
```

Run `npm run rebuild` if there is Node Module Mismatch Error while running test, this will build the native modules for Nodejs.

## Application Data Model

The following diagram depicts how the emails are stored in the SAFE network, as well as how the email app stores email accounts information.

![Email App Data Model](./design/EmailApp-DataModel.png)
