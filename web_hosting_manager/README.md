# SAFE Hosting Manager
The tutorial app show cases how to create and manage web services for Public ID on SAFE Network. Demonstrates the usage of MutableData API, NFS API, Authentication APIs.

## Install

* **Note: requires a node version ^8.0.0 and an npm version ^5.0.0**

First, clone the repo via git:

```bash
$ git clone https://github.com/maidsafe/safe_examples && cd safe_examples/web_hosting_manager
```
Do you want to develop on a local mock network?
Then run:
```bash
export NODE_ENV=dev
If running Windows Powershell: $env:NODE_ENV = "dev"
```

Or do you want to connect with live network?
```bash
export NODE_ENV=prod
If running Windows Powershell: $env:NODE_ENV = "prod"
```
Then install Node.js dependencies:

```bash
$ yarn
```
Now to run, if `NODE_ENV=prod` use:
```bash
$ yarn start
```
If `NODE_ENV=dev` use:
```bash
$ yarn dev
```
## Packaging

To package apps for the local platform:

```bash
$ yarn package
```

## Test

```bash
yarn test
```

Run `yarn rebuild-test` if there is Node Module Mismatch Error while running test, this will build the native modules for Nodejs. To build it back to Electron run `yarn rebuild`, now you can start the application.

# License

Licensed under either of

* the MaidSafe.net Commercial License, version 1.0 or later ([LICENSE](LICENSE))
* the General Public License (GPL), version 3 ([COPYING](COPYING) or http://www.gnu.org/licenses/gpl-3.0.en.html)

at your option.

# Contribution

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in the
work by you, as defined in the MaidSafe Contributor Agreement, version 1.1 ([CONTRIBUTOR]
(CONTRIBUTOR)), shall be dual licensed as above, and you agree to be bound by the terms of the
MaidSafe Contributor Agreement, version 1.1.
