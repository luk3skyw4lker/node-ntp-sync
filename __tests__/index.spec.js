const Client = require('../index').Client;

test('Sync time', async () => {
	const NTPClient = new Client();
	const date = new Date();

	const { time } = await NTPClient.syncTime();

	expect(time.getDay()).toEqual(date.getDay());
	expect(time.getHours()).toEqual(date.getHours());
	expect(time.getMinutes()).toEqual(date.getMinutes());
});
