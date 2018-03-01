# SAFE WebRTC Example
Webrtc secure signalling example application on SAFE Network.

> NOTE: This application is supported only on latest [Peruse](https://github.com/joshuef/peruse/releases/) application.
# Install

First, clone the repo via git:
```
$ git clone https://github.com/maidsafe/safe_examples && cd safe_examples/safe_webrtc_example
```

And then install Node.js dependencies.

```
$ yarn
```

# Configure STUN and TURN server

Configure the STUN and TURN server in `app/constants.js` before building the application.

```
CONFIG: {
  SERVER: {
    iceServers: [
      { url: 'STUN_SERVER_URL' }, // fill STUN Server url
      {
        url: 'TURN_SERVER_URL', // fill turn server url
        credential: 'TURN_PASSWORD', // fill turn server password
        username: 'TURN_USERNAME' // fill turn server username
      },
    ]
  },
}
```

# Build

Bundle the application to host it on SAFE Network:
```
$ yarn build
```

Bundled files are found within `dist` folder.


# Run

To open application on `localhost` run,
```
$ yarn start
```
and open `localhost/<PUBLIC ID>:8080/` on Peruse application.
