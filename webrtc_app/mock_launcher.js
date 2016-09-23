const express = require('express');
const jsonParser = require('body-parser').json();
var rawbody = require('express-rawbody');

const STORE = {};
const TOKEN = Math.random()
const INTERNAL_PREFIX = '' + Math.floor(Math.random() * 100000)
const app = express();

app.post("/auth", jsonParser, (req, res) => {
  var body = req.body;
  if (!body.app || !body.app.name || !body.app.id || !body.app.version || !body.app.vendor){
    return res.status(400).set('Content-Type', 'application/json').json({"error": "INCOMPLETE", "messages": "missing app information"})
  }
  if (!body.permissions || body.permissions.length == 0) {
    return res.status(400).set('Content-Type', 'application/json').json({"error": "INCOMPLETE", "messages": "missing permissions information"})
  }

  // see https://github.com/maidsafe/rfcs/blob/master/text/0042-launcher-api-v0.6/0042-launcher-api-v0.6.md#permission
  if (!body.permissions.indexOf("LOW_LEVEL_API") === -1) {
    return res.status(403).set('Content-Type', 'application/json').json({"error": "INCOMPLETE", "messages": "you need to ask for LOW_LEVEL_API permission for this mock"})
  }

  res.send(JSON.stringify({"permissions": body.permissions, "token": TOKEN}))
})


// https://github.com/maidsafe/rfcs/blob/master/text/0042-launcher-api-v0.6/api/structured_data.md#create
app.post("/structured-data/:id", rawbody, (req, res) => {
  if (req.headers.authorization != 'Bearer ' + TOKEN) {
    return res.status(403).set('Content-Type', 'application/json').json({"error": "UNAUTHORIZED", "messages": "you are not allowed to run this method"})
  }
  const tagType = parseInt(req.headers['Tag-Type'] || 500, 10);
  if (tagType != 500 && tagType != 501 && tagType <= 15000) {
    return res.status(400).set('Content-Type', 'application/json').json({"error": "DISALLOWED_TAG_TYPE", "messages": "Header Tag-Type must be 500, 501 or above 15000"})
  }

  const encryption = (req.headers['Encryption'] || 'NONE').toUpperCase();
  if (![null, "NONE", "SYMMETRIC", "HYBRID"].indexOf(encryption)){
    return res.status(400).set('Content-Type', 'application/json').json({"error": "DISALLOWED_ENCRYPTION", "messages": "Header Encryption must be NONE, SYMMETRIC or HYBRID"})
  }
  if (!req.rawBody) {
    return res.status(400).set('Content-Type', 'application/json').json({"error": "EMPTY_CONTENT", "messages": "you need to provide some data"})
  }

  if (STORE[req.params.id]){
    res.status(409).set('Content-Type', 'application/json').json({"error": "CONFLICT", "message": "item already exists"})
  }

  STORE[req.params.id] = req.rawBody
  res.status(200).send("ok")
})

//https://github.com/maidsafe/rfcs/blob/master/text/0042-launcher-api-v0.6/api/structured_data.md#get-data-identifier-handle
app.get("/structured-data/handle/:id", (req, res) => {
  if (req.headers.authorization != 'Bearer ' + TOKEN) {
    return res.status(403).set('Content-Type', 'application/json').json({"error": "UNAUTHORIZED", "messages": "you are not allowed to run this method"})
  }
  const tagType = parseInt(req.headers['Tag-Type'] || 500, 10);
  if (tagType != 500 && tagType != 501 && tagType <= 15000) {
    return res.status(400).set('Content-Type', 'application/json').json({"error": "DISALLOWED_TAG_TYPE", "messages": "Header Tag-Type must be 500, 501 or above 15000"})
  }

  if (!STORE[req.params.id]) {
    return res.status(404).set('Content-Type', 'application/json').json({"error": "NOT_FOUND", "message": "Structured Data not found."})
  }

  res.set({"Is-Owner" : Math.random() > 0.5,
           "Handle-Id": INTERNAL_PREFIX + "-" + req.params.id})
  res.send("ok")
})


// https://github.com/maidsafe/rfcs/blob/master/text/0042-launcher-api-v0.6/api/structured_data.md#read-data
app.get("/structured-data/:id/:version?", (req, res) => {
  if (req.headers.authorization != 'Bearer ' + TOKEN) {
    return res.status(403).set('Content-Type', 'application/json').json({"error": "UNAUTHORIZED", "messages": "you are not allowed to run this method"})
  }

  const encryption = (req.headers['Encryption'] || 'NONE').toUpperCase();
  if (![null, "NONE", "SYMMETRIC", "HYBRID"].indexOf(encryption)){
    return res.status(400).set('Content-Type', 'application/json').json({"error": "DISALLOWED_ENCRYPTION", "messages": "Header Encryption must be NONE, SYMMETRIC or HYBRID"})
  }
  // remove the internal prefix
  const itemId = req.params.id.slice(INTERNAL_PREFIX.length + 1)
  console.log(itemId)
  const content = STORE[itemId]

  if (!content) {
    return res.status(404).set('Content-Type', 'application/json').json({"error": "NOT_FOUND", "message": "Structured Data not found."})
  }

  res.set({"Is-Owner" : Math.random() > 0.5,
           "Version-Length": content.length,
           "Version-Number": req.params.version || 0})
  res.send(content)
})

// https://github.com/maidsafe/rfcs/blob/master/text/0042-launcher-api-v0.6/api/structured_data.md#read-data
app.delete("/structured-data/:id", (req, res) => {
  if (req.headers.authorization != 'Bearer ' + TOKEN) {
    return res.status(403).set('Content-Type', 'application/json').json({"error": "UNAUTHORIZED", "messages": "you are not allowed to run this method"})
  }

  // remove the internal prefix
  const actId = req.params.id.split("-", 2);
  if (actId[0] != INTERNAL_PREFIX) {
    return res.status(404).set('Content-Type', 'application/json').json({"error": "NOT_FOUND", "message": "Structured Data not found."})
  }

  const content = STORE[actId[1]]

  if (!content) {
    return res.status(404).set('Content-Type', 'application/json').json({"error": "NOT_FOUND", "message": "Structured Data not found."})
  }

  delete STORE[actId[1]]

  res.send('ok')
})

// https://github.com/maidsafe/rfcs/blob/master/text/0042-launcher-api-v0.6/api/structured_data.md#drop-handle
app.delete("/structured-data/handle/:id", (req, res) => {
  if (req.headers.authorization != 'Bearer ' + TOKEN) {
    return res.status(403).set('Content-Type', 'application/json').json({"error": "UNAUTHORIZED", "messages": "you are not allowed to run this method"})
  }
  // no op
  res.send('ok')
})



app.listen(9999, () => {
  console.log('Mock launcher listening on 9999!');
});
