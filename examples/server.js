const Server = require("../index").Server;
const server = new Server(function(message) {
  console.log("server message:", message);
  message.transmitTimestamp = Date.now();

  response(message);
});

server.listen(3000, err => {
  if (err) throw err;

  console.log("Server listening on:", 3000);
});
