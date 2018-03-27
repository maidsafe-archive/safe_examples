# SAFE Hosting Manager App Change Log

## [Unreleased]
### Changed
- Upgrade Node JS to ^8.0.0
- Upgrade electron to 1.8.4 which solves reported security vulnerabilities
- Upgrade @maidsafe/safe-node-app to v0.8.1

### SAFE libraries dependencies
- @maidsafe/safe-node-app: v0.8.1

## [0.4.4] - 20-12-2017
### Changed
- Upgrade `@maidsafe/safe-node-app` to v0.6.0

### Fixed
- fix/Make sure that all non-web services are filtered out from the list of services

### SAFE libraries dependencies
- @maidsafe/safe-node-app: v0.6.0

## [0.4.3]

- Upgrade `@maidsafe/safe-node-app` to v0.5.1

## [0.4.2]

- Compatible with Safe Browser `v0.8.0`
- Changes to upgrade `@maidsafe/safe-node-app` package to `v0.5.0`
- Compatible with Alpha-2 network data

## [0.3.0]

- UI/UX updated based on the new designs mock-ups
- Simple template publishing feature included

## [0.2.2]

- MAID-2330: deleting a service now deletes all the files contained in it.

## [0.2.1]

- Issues with downloading empty files were solved.
- Uploading empty directories is now correctly handled.
- Crash caused by uploading empty files is fixed.

## [0.2.0]
- Support for creating services within a public ID created by another application by requesting access to share the service container (shared MutableData authorisation process).
- Support for multiple selection of both files and directories for the upload actions. Now when uploading a directory it gets uploaded with it entire hierarchy, including the root directory which gets created on the target location. This is also applicable when uploading multiple directories.
- Issues when trying to cancel an upload process of a folder with many files were fixed.
- Some bugs when trying to delete services and folders were solved.
- The list of files/folders is now automatically refreshed after deleting files/folders.
- Solved minor UI issues when trying to upload multiple files while running out of PUTs credit.
- Solved issues when uploading empty files.
- Issues with progress bar for uploading directories and files solved.

## [0.1.2]

- Present user friendly error messages
- Long public/service name is truncated and shown on the UI
- NFS API updated to recent changes in safe_client_libs master branch. The NFS API was using ImmutableData to store the files and now the API is updated to save DataMap.
- Disable window resizing
- Compatible with TEST-18
