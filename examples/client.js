const NTP = require("../index").Client;
const client = new NTP("a.st1.ntp.br", 123, { timeout: 3000 });

client
	.syncTime()
	.then((response) => console.log("TIME:", response))
	.catch(console.log);
