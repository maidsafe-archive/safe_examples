# SAFE Network Signalling Example (using WebRTC)

![](./src/logo.svg)

## Setup

You need node + npm. Install all dependencies by running

```bash
npm install
```

And start the development server by running

```
npm run start
```

This should open a browser window with the app starting up. Otherwise redirect your browser to `http://localhost:3000/`. 

## Usage

Just type a random room name or take the one suggested, give the requested permissions, open another session and type the same room name (or click on the link provided in the header).

You should be able to connect to one another with video, audio and a small chat on the left. You can see yourself on the bottom right, your peer is visible in the center. Enjoy

## TURN configuration

By default this is delivered with a publicly usable STUN configuration, however some set ups might require a TURN configuration. For that replace the `src/config.json`-file the configuration you need. It will post whatever you put into that json as the `config` to `new SimplePeer()` - ]see here for the documentation](https://github.com/feross/simple-peer#api).

**Example**:
```JSON
{
    "iceServers": [
        { "urls": "stun:23.21.150.121" },
        { "urls": "turn:numb.viagenie.ca",
          "username": "something@example.com",
          "credentials": "secretPassword" }
    ]
}
```

_WARNING:_ when deploying this username and password will be made available in plain text accessible to anyone through the browser!

## Development

This is a minimal [Create React App](https://github.com/facebookincubator/create-react-app). Learn more about developing on this project by consulting the [REACT_DOCS](./REACT_DOCS.md) file in this folder.

## Deploying:

Just run `npm run build` and the entire app (including the `index.html`) will be build into `build`. Upload that entire directory using the SAFE Demo Apps. Done.

## LICENSE

GPL 3.0. See LICENSE in root folder for details.
