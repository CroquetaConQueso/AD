const { MongoClient } = require('mongodb');

async function checkData() {
    const uri = "mongodb://localhost:27017";
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db('hospital-db'); // Ensure this matches application.properties
        const collections = await db.listCollections().toArray();

        console.log("Connected to database:", db.databaseName);
        console.log("Collections:", collections.map(c => c.name));

        if (collections.length === 0) {
            console.log("⚠️ Database is empty (no collections found).");
        } else {
            for (const col of collections) {
                const count = await db.collection(col.name).countDocuments();
                console.log(`- ${col.name}: ${count} documents`);
            }
        }
    } catch (e) {
        console.error("❌ Error checking data:", e);
    } finally {
        await client.close();
    }
}

checkData();
