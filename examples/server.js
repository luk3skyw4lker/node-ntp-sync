const Server = require('../index').Server;
const server = new Server();

server.handle((message, response) => {
	console.log('Server message:', message);

	message.transmitTimestamp = Math.floor(Date.now() / 1000);

	response(message);
});

server.listen(123, err => {
	if (err) throw err;

	console.log('Server listening on:', 123);
});
