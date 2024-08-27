const { MongoClient } = require('mongodb');

async function main() {
    const uri = "mongodb://localhost:27017";
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log("Connected successfully to local MongoDB");
        
        const database = client.db("testdb");
        const collection = database.collection("devices");
        
        const result = await collection.insertOne({ name: "Smart Phone", brand: "TechCo" });
        console.log(`Document inserted with _id: ${result.insertedId}`);
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

main().catch(console.error);