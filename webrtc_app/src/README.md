# SAFE Network Signaling Example (using WebRTC)

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

This should open a browser window with the app starting up. Otherwise redirect your browser to `http://localhost:3000/`

## Usage

The app should automatically try to establish an WebRTC Connection. It will then promptly give you a link for a second screen to join. *Copy* that link and open it in another browser (or share it with another person over some form of instant messenger).

When opening the second link, the app will automatically connect to through WebRTC, too, using the provided token. However the first client still needs to know about the second one. So the that app should show a text box and ask the user to transfer the content to the first. Just copy that content and send it to the first user.

That first user should put that content into the provided textarea and push "send". The connection should be established immediately and text field pop up. Type your message there and press send (or enter) to send a message. Messages send by you and received from the other party will be shown below in a newest-first-order.

## Development

This is a minimal [Create React App](https://github.com/facebookincubator/create-react-app). Learn more about developing on this project by consulting the [REACT_DOCS](./REACT_DOCS.md) file in this folder.

## LICENSE

GPL 3.0. See LICENSE in root folder for details.
