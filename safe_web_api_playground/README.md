#### SAFE browser website development tool

This package is meant to help people that desire to create websites for the SAFE network, especially those sites that need to utilize the SAFE network web API, available on the global `window` object.

Instead of having to upload your site to the network every time you want to test some code, simply use this package to experiment.


###### SETUP

- Clone this repository and `cd` into the respective directory
- Run `yarn`
- Run `yarn gulp` to start server
- Visit `localhost:3003` in your SAFE browser to see page

To upload this site to the network:
 - Run `npm run gulp` and observe the `build` directory that's created
 - Using [web_hosting_manager](https://github.com/maidsafe/safe-web-hosting-manager-electron/releases/latest), simply upload the `build` directory
