# Safe DNS Example

An example application to demonstrate uploading files of a static website to the Safe network. This examples showcases features from the `safe_nfs` and `safe_dns` crates.

## Pre-Requisites
  NodeJs should be installed

##Dependency

Build the [safe_ffi](https://github.com/maidsafe/safe_ffi/) rust code to generate the ffi library.
Place this corresponding lib(`libsafe_ffi.{so, dylib, dll}`) library in the `src/scripts/safe_api` folder
Also add the libsodium dependency in the `src/scripts/safe_api` folder. For linux, add `libsodium.so.<version>` instead of `libsodium.so` 

## Development

After cloning the repository, install npm and bower dependencies.
```
$ npm install
$ bower install
```

Rebuild the native dependencies with electron-rebuild by executing, `./node_modules/.bin/electron-rebuild`

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
