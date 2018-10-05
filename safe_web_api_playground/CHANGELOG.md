# SAFE web API playground Change Log

## 3.1.0
- Complies with Bootstrap4
- Adds Emacs bindings toggle

## 3.0.0
- Refactors code-snippets for newly exposed web API which is nearly identical to safe_app_nodejs

## 2.1.0

- embeds text editor to improve user experience(codemirror)
  - toggle vim key bindings
  - smart indent
  - active line highlight
  - syntax highlighting

- improved layout
  - reduces size of font for module and function names
  - increased editor area
  - improved responsiveness
  - cleaner and more intuitive scroll bars

## 2.0.0

- improved error handling

- refactor code to use async/await

- window.safeApp additions
  - isNetStateInit
  - isNetStateConnected
  - isNetStateDisconnected
  - clearObjectCache
  - isMockBuild

- window.safeCrypto additions
  - generateSignKeyPair
  - pubSignKeyFromRaw
  - secSignKeyFromRaw
  - generateSignKeyPairFromRaw

- window.safeCryptoPubSignKey addition
  - verify

- window.safeCryptoSecSignKey additions
  - getRaw
  - sign
  - free

- window.safeCryptoSignKeyPair additions
  - getPubSignKey
  - getSecSignKey

- window.safeMutableDataPermissions
  - `forEach` changed to `listPermissionSets`
  - insertPermissionsSet no longer takes permissionSetHandle, instead takes an array of permissions

- safeMutableData
  - removes free function
  - removes newPermissionsSet function
  - getKeys returns array of mutable data keys
  - getValues returns array of mutable data values

- removes safeMutableDataValues
- removes safeMutableDataKeys
- removes safeMutableDataPermissionsSet

- safeCryptoKeyPair -> safeCryptoEncKeyPair
