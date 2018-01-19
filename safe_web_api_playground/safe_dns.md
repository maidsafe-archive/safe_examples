# SAFE DNS overview

Example URL: safe://safeapi.playground

`playground` is our example public ID.  
`safeapi` is our example service.

This is the mutable data structure, with type tag 15002, that composes a web service, holding file entries:
```
newRandomPublicMD<type_tag: 15002>: {
  index.html: <fileData>,
  favicon.ico: <fileData>
}
```
This is the mutable data structure, with type tag 15001, that is represented by the sha3 hash of our public id, holding an XOR name reference to the service above.
```
newPublicMD<name: sha3hash("playground")><type_tag: 15001>: {
  safeapi: newRandomPublicMD<type_tag: 15002>.name
}
```

```
let key = "playground";
let value = sha3hash("playground");

_publicNames {
  encrypted(key): encrypted(value)
}
```


```
_public: {
  _public/playground/root-safeapi: newRandomPublicMD<type_tag: 15002>.name
```
