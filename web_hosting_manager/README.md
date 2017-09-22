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
$ yarn
```

Finally, rebuild the native modules

```bash
$ yarn run rebuild
```

## Run

Run these two commands __simultaneously__ in different console tabs.

```bash
$ yarn run hot-server
$ yarn run start-hot
```

or run two servers with one command

```bash
$ yarn run dev
```

### Authorising against Mock

To simplify the auth process, as web-hosting can't received a response when running in dev mode, authorise the application via the safe playground, using the applications own app object (below). You can then add the `authUri` to the [webhosting app](https://github.com/maidsafe/safe_examples/blob/master/web_hosting_manager/app/menu.js#L51). 

Finally, run the app, and in the main menu, select `Simluate Mock Response`, and you're good to go.

```js
let appInfo = {
      id: 'net.maidsafe.examples.webhostingmanager',
      name: 'Web Hosting Manager',
      vendor: 'MaidSafe',
      scope: null,
      opt: {
            own_container: false
          },
      permissions: {
        _public: [
          'Read',
          'Insert',
          'Update',
          'Delete'
        ],
        _publicNames: [
          'Read',
          'Insert',
          'Update',
          'Delete'
        ]
      }
    };
```

## Packaging

To package apps for the local platform:

```bash
$ yarn run package
```

## Further commands

To run the application without packaging run

```bash
$ yarn run build
$ yarn start
```
#### Clear Access Data
#####macOs
 Click `SAFE Hosting Manager -> Clear Access Data` from the menu.
#####Windows and Linux
 Click `File -> Clear Access Data` from the menu.

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
