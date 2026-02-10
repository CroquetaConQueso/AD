const http = require('http');

const options = {
    hostname: 'localhost',
    port: 8081,
    path: '/api/patients',
    method: 'GET',
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers, null, 2)}`);
    res.setEncoding('utf8');
    let body = '';
    res.on('data', (chunk) => {
        body += chunk;
    });
    res.on('end', () => {
        console.log(`BODY START: ${body.substring(0, 100)}`);
        console.log(`BODY TYPE: ${typeof body}`);
        try {
            const json = JSON.parse(body);
            console.log(`IS ARRAY: ${Array.isArray(json)}`);
            console.log(`KEYS: ${Object.keys(json).join(', ')}`);
            if (!Array.isArray(json)) {
                console.log(`FULL BODY: ${body}`);
            }
        } catch (e) {
            console.log("NOT VALID JSON");
        }
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.end();
