const NTP = require("../index").Client;
const client = new NTP("127.0.0.1", 4567, { timeout: 3000 });

client.syncTime((err, result) => {
  if (err) throw err;

  console.log(result);
});
