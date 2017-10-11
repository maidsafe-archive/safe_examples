# SAFE Hosting Manager
The tutorial app show cases how to create and manage web services for Public ID on SAFE Network. Demonstrates the usage of MutableData API, NFS API, Authentication APIs.

## Install

* **Note: requires a node version 7.10.0 and an npm version 4.2.0**

First, clone the repo via git:

```bash
$ git clone https://github.com/maidsafe/safe_examples && cd safe_examples/web_hosting_manager
```

And then install Node.js dependencies.

```bash
$ yarn
```

## Run

```bash
$ yarn start
```

### Authorising against Mock

To simplify the auth process, as web-hosting can't received a response when running in dev mode.

Run the app, and in the main menu, select `Simulate Mock Response`, and you're good to go.

## Packaging

To package apps for the local platform:

```bash
$ yarn run package
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