# MaidSafe Email Tutorial App Change Log

## [Unreleased]
### Changed
- Update to Node JS to ^8.0.0
- Update @maidsafe/safe-node-app to v0.6.1
- Make use of `safeApp.auth.openUri` function for sending auth requests instead of `electron.shell.openExternal`

### SAFE libraries dependencies
- @maidsafe/safe-node-app: v0.6.1

## [0.4.3] - 20-12-2017
### Changed
- Upgrade `@maidsafe/safe-node-app` to v0.6.0

### Fixed
- The update to @maidsafe/safe-node-app fixes issue with malformed auth URI's on Fedora, using default GNOME3 window manager

### SAFE libraries dependencies
- @maidsafe/safe-node-app: v0.6.0

## [0.4.2]

- Upgrade `@maidsafe/safe-node-app` to v0.5.1

## [0.4.1]

- Compatible with Safe Browser `v0.8.0`
- Changes to upgrade `@maidsafe/safe-node-app` package to `v0.5.0`
- Compatible with Alpha-2 network data

## [0.4.0]

- Ability to switch between multiple Id
- Compatible with Safe Browser `v0.6.0`
- Uses safe-app-nodejs `v0.3.0`

## [0.3.0]

- Support for creating services within a public ID created by another application by requesting access to share the service container (shared MutableData authorisation process).
- The list of emails is now sorted by time in a descending order.
- Support for replying to emails.
- Minor UI issues in the compose email form were solved.
- Make the counter of used storage to take into account that emails are only soft-deleted from the inbox MutableData.
- Make use of the crypto functions exposed by safe_app_nodejs to encrypt/decrypt emails instead of using sodium library directly.
- Adapt to rename of safe_app_nodejs function from `getHomeContainer` to `getOwnContainer`.

## [0.2.2]

- Compatible with Test-18 network

## [0.2.1]

- Updated to be compatible with latest version of the authenticator
- Support for multiple email ids
- Compatible with Test-17 network

## [0.1.2]

- Unversioned Tag Type Corrected
- Compatible with launcher `v0.9.2`

## [0.1.1]

- Updated to work with launcher `v0.9.1`

## [0.1.0]

- Implementation of email with features send mail and receive mail
- Save mails to `Saved Mail` section
