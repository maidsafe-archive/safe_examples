# SAFE DNS overview

Example URL: safe://safeapi.playground

`playground` is our example public ID.  
`safeapi` is our example service.

This is the mutable data structure that composes a web service, holding file entries:
```
newRandomPublic.name<15002>: {
  index.html: <fileData>,
  favicon.ico: <fileData>
}
```
This is the mutable data structure that is represented by our public id, holding a name reference to the service above.
```
hashed("playground")<15001>: {
  safeapi: 'newRandomPublic.name'
}
```

```
let key = "playground";
let value = hashed("playground");

_publicNames {
  encrypted(key): encrypted(value)
}
```


```
_public: {
  _public/playground/safeapi-root: 'newRandomPublic.name'
}
```
