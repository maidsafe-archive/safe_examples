[![Build status](https://ci.appveyor.com/api/projects/status/2fnekwfbm5h2ayk7/branch/master?svg=true)]

# safe_examples
Examples showcasing various features of the SAFE Network

## email_app (NodeJS - Electron)
[email_app](email_app), written in `NodeJS`. Example application to exchange messages.

## safe_web_api_playground (NodeJS - Electron)
[safe_web_api_playground](safe_web_api_playground), written in `NodeJS`. Application to help in exploring the web api.


## web_hosting_manager (NodeJS - Electron)
[web_hosting_manager](web_hosting_manager), written in `NodeJS`. Example application to allow hosting and managing web files.


For more details and build-instructions, please check the corresponding folder's README.

## Packaging

To run a complete package of the email/webhosting apps, (assuming each project has their own dependencies installed) you can run:

* Run `yarn` in the root examples directory
* Run `yarn install-all` to install and build `email_app` and `web_hosting_manager`.
* Use either of the commands below to separately package each app:
* Run `yarn pack:webhosting` to package and zip the app with all required files (to: web_hosting_manager/release).
* Run `yarn pack:email` to package and zip the app with all required files (to: email_app/out).
* Alternatively, run `yarn package-all` to package both `email_app` and `web_hosting_manager`

# License

The projects published in this repository are dual-licensed under

* the Modified BSD ([LICENSE-BSD](https://opensource.org/licenses/BSD-3-Clause)) or
* the MIT license ([LICENSE-MIT](http://opensource.org/licenses/MIT))

at your option.
