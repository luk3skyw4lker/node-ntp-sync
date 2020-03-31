# ntp-sync

## Installation

With [npm](https://npmjs.com):

    npm install ntp-sync

With [yarn](https://yarnpkg.com):

    yarn add ntp-sync

# Methods and usage

## Client

To instantiate an NTP Client you just have to require the client class from the module and then instantiate it inside your code. To get the time you must use the `syncTime` method.

### client.js

```javascript
const NTP = require("ntp-sync").Client;
const client = new NTP("a.st1.ntp.br", 123, { timeout: 5000 });

client.syncTime((err, result) => {
  if (err) throw err;

  console.log(result);
});
```

## Server

To put a server up, you must require the server class from the `ntp-sync` module, pass a request callback to it and use the listen method, with a port and an callback as an argument. Inside the request callback you can manipulate the message the way you want.

### server.js

```javascript
const NTPServer = require("ntp-sync").Server;
const server = new NTPServer((message, response) => {
  message.transmitTimestamp = Date.now();

  response(message);
});

server.listen(3000, err => {
  if (err) throw err;

  console.log("Server listening");
});
```

For more didatic code, go to the examples page.
