const NTP = require("../index").Client;
const client = new NTP("a.st1.ntp.br", 123, { timeout: 3000 });

client.syncTime((err, result) => {
  if (err) throw err;

  console.log(result);
});
