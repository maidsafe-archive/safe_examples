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

Just type a random room name (support to autogenerate rooms will be added later), give the requested permissions, open another session and type the same room name (or click on the link provided in the header).

You should be able to connect to one another with video, audio and a small chat on the left. You can see yourself on the bottom right, your peer is visible in the center. Enjoy

## Development

This is a minimal [Create React App](https://github.com/facebookincubator/create-react-app). Learn more about developing on this project by consulting the [REACT_DOCS](./REACT_DOCS.md) file in this folder.

## LICENSE

GPL 3.0. See LICENSE in root folder for details.
