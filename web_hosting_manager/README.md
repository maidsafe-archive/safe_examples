# SAFE Hosting Manager

#### Prerequisites
> SAFE Hosting Manager uses **[keytar](https://www.npmjs.com/package/keytar)** module as its dependency. Please install the prerequisites mentioned [here](https://www.npmjs.com/package/keytar#installing) based on the platform.

## Install

* **Note: requires a node version 6.5.0 and an npm version 3.10.3**

First, clone the repo via git:

```bash
$ git clone https://github.com/maidsafe/safe_examples && cd safe_examples/web_hosting_manager
```

And then install Node.js dependencies.

```bash
$ npm i
```

Finally, rebuild the native modules

```bash
$ npm run rebuild
```

## Run

Run these two commands __simultaneously__ in different console tabs.

```bash
$ npm run hot-server
$ npm run start-hot
```

or run two servers with one command

```bash
$ npm run dev
```

## Packaging

To package apps for the local platform:

```bash
$ npm run package
```

To package apps for all platforms:

```bash
$ npm run package-all
```

To package apps with options:

```bash
$ npm run package -- --[option]
```

## Further commands

To run the application without packaging run

```bash
$ npm run build
$ npm start
```

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
