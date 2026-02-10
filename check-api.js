async function checkApi() {
    const endpoints = [
        'http://localhost:8080/api/staff',
        'http://localhost:8080/api/patients'
    ];

    for (const url of endpoints) {
        try {
            console.log(`Fetching ${url}...`);
            const res = await fetch(url);
            if (!res.ok) {
                console.error(`❌ Error fetching ${url}: ${res.status} ${res.statusText}`);
                continue;
            }
            const data = await res.json();
            console.log(`✅ Success ${url}:`, JSON.stringify(data, null, 2));
        } catch (err) {
            console.error(`❌ Failed to fetch ${url}:`, err.message);
        }
    }
}

checkApi();
