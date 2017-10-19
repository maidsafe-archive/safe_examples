# safe_examples
Examples showcasing various features of the SAFE Network

## email_app (NodeJS - Electron)
[email_app](email_app), written in `NodeJS`. Example application to exchange messages.

## safe_web_api_playground (NodeJS - Electron)
[safe_web_api_playground](safe_web_api_playground), written in `NodeJS`. Application to help in exploring the web api.


## web_hosting_manager (NodeJS - Electron)
[web_hosting_manager](web_hosting_manager), written in `NodeJS`. Example application to allow hosing and managing web files.


For more details and build-instructions, please check the corresponding folder's README.

## Packaging

To run a complete package of the email/webhosting apps, (assuming each project has their own dependencies installed) you can run:

* Run `yarn` in the root examples directory
* Run `yarn pack:webhosting` to package and zip the app with all required files (to: web_hosting_manager/release).
* Run `yarn pack:email` to package and zip the app with all required files (to: email_app/out).
