# Safe DNS Example

An example application to demonstrate uploading file to the Safe network

## Pre-Requisites
  NodeJs should be installed

##Dependency

Build the [safe_ffi](https://github.com/maidsafe/safe_ffi/) rust code to generate a dynamic library.
Place the library in the `src/scripts/safe_api` folder


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
