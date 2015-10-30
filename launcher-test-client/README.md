# Launcher-Test-Client

This is a simple application written in rust that could serve as an example of how to interface with Safe-Launcher via IPC to do work on the SAFE Network. It does the handshake, establishes secure communication with Launcher and does a mutating and a fetching operation. Then it self terminates.

## Prerequisite

[libsodium](https://github.com/jedisct1/libsodium) is a native dependency, and can be installed by following the instructions [for Windows](https://github.com/maidsafe/QA/blob/master/Documentation/Install%20libsodium%20for%20Windows.md) or [for OS X and Linux](https://github.com/maidsafe/QA/blob/master/Documentation/Install%20libsodium%20for%20OS%20X%20or%20Linux.md).

## Build Instructions

Simply do `cargo build` or `cargo build --release`. Once the binary is created, add it to Safe-Launcher (e.g. by using `launcher_cli` in examples section for the main [Safe-Launcher Project](https://github.com/maidsafe/safe_launcher)) and run it from within Launcher.
