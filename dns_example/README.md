# Safe DNS Example

An example application to demonstrate uploading files of a static website to the Safe network. This examples showcases features from the `safe_nfs` and `safe_dns` crates.

## Pre-Requisites
  NodeJs should be installed
  bower is installed globally. 

##Dependency

Build the [safe_ffi](https://github.com/maidsafe/safe_ffi/) rust code to generate the ffi library.
Place this corresponding lib(`libsafe_ffi.{so, dylib, dll}`) library in the `src/scripts/safe_api` folder

## Development

After cloning the repository, install npm and bower dependencies.
```
$ npm install
$ bower install
```

Rebuild the native dependencies with electron-rebuild by executing, `npm run electron-rebuild`

### Run the code

```
$ npm start
```

### Package the application

```
$ npm run build-win
$ npm run build-linux
$ npm run build-osx
```

`npm run build-{platform}` will build the project for 64bit binaries

Builds the app for OS X, Linux, and Windows, using [electron-packager](https://github.com/maxogden/electron-packager).

### Logging

Application by default Log level is 'info'

Log level can be explicitly set by using the `LOG_LEVEL` environment variable before starting the application

Example, `set LOG_LEVEL=verbose` (windows) or `export LOG_LEVEL=verbose` (OSX & Linux).

Permitted values for LOG_LEVEL can be found [here](https://www.npmjs.com/package/npmlog#log-level-prefix-message)
