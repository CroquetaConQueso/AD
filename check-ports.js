const net = require('net');

const ports = [
    { port: 27017, name: 'MongoDB' },
    { port: 8080, name: 'Backend (Spring Boot)' },
    { port: 4200, name: 'Frontend (Angular)' }
];

ports.forEach(service => {
    const client = new net.Socket();
    const start = Date.now();

    // Set a timeout
    client.setTimeout(2000);

    console.log(`Checking ${service.name} on port ${service.port}...`);

    client.connect(service.port, 'localhost', function () {
        console.log(`✅ SUCCESS: Connected to ${service.name} (Port ${service.port}) in ${Date.now() - start}ms`);
        client.destroy();
    });

    client.on('error', function (err) {
        console.error(`❌ FAILED: Could not connect to ${service.name} (Port ${service.port}). Error: ${err.message}`);
        client.destroy();
    });

    client.on('timeout', function () {
        console.error(`❌ TIMEOUT: Connection to ${service.name} (Port ${service.port}) timed out.`);
        client.destroy();
    });
});
