# safe_examples
Examples showcasing various features of the SAFE Network

## web_hosting_manager (NodeJS - Electron)
[web_hosting_manager](web_hosting_manager), written in `NodeJS`, demonstrates key features exposed by the SAFE Network.

For more details and build-instructions, please check the corresponding folder's README.

## Packaging

To run a complete package of the email/webhosting apps, (assuming each project has their own dependencies installed) you can run:

* Run `yarn` in the root examples directory
* Run `yarn pack:webhosting` to package and zip the app with all required files (to: web_hosting_manager/release).
* Run `yarn pack:email` to package and zip the app with all required files (to: email_app/out).
