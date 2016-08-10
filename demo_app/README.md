# maidsafe_demo_app
MaidSafe demo application demonstrates the key features of the SAFE Network.

# Quick start
The development dependency of this project is [Node.js](https://nodejs.org).
Then type few commands known to every Node developer...
```
npm install
npm start
```

# Development

#### Installation

```
npm install
```
It will also download Electron runtime, and install dependencies for second `package.json` & `bower.json` file inside `app` folder.

#### Starting the app

```
npm start
```

#### Adding npm modules to your app

Remember to add your dependency to `app/package.json` file, so do:
```
cd app
npm install name_of_npm_module --save
```

#### Unit tests

To run it go with standard:
```
npm test
```

# Making a distributable package

To make ready for distribution package use command based on the platform:
```
npm run package
```
this will generate the package files in the `app_dist` folder

Additional `arch` argument can be passed to the `package` command. If this argument is not specified,
the current nodejs platform architecture will be used. Accepted values are `x86` and `x64`.

Example usage `npm run package -- --arch=x64`
