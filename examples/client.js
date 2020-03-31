const NTP = require("../index").Client;
const client = new NTP();

client.syncTime((err, result) => {
  if (err) throw err;

  console.log(result);
});
