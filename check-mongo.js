const net = require('net');

const client = new net.Socket();
const start = Date.now();

console.log('Checking MongoDB on 27017...');

client.setTimeout(5000); // 5 seconds timeout

client.connect(27017, 'localhost', function () {
    console.log(`✅ SUCCESS: Connected to MongoDB (Port 27017) in ${Date.now() - start}ms`);
    client.destroy();
});

client.on('error', function (err) {
    console.error(`❌ FAILED: Could not connect to MongoDB. Error: ${err.message}`);
    client.destroy();
});

client.on('timeout', function () {
    console.error(`❌ TIMEOUT: Connection to MongoDB timed out.`);
    client.destroy();
});
