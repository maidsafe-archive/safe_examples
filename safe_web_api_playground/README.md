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

## License

This SAFE Network library is dual-licensed under the Modified BSD ([LICENSE-BSD](LICENSE-BSD) https://opensource.org/licenses/BSD-3-Clause) or the MIT license ([LICENSE-MIT](LICENSE-MIT) https://opensource.org/licenses/MIT) at your option.

## Contribution

Copyrights in the SAFE Network are retained by their contributors. No copyright assignment is required to contribute to this project.
