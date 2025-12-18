import * as dotenv from 'dotenv';
dotenv.config();

import { MongoClient, ObjectId } from "mongodb";
import debug from 'debug';
const debugDb = debug('app:Database');

const newId = (str) => ObjectId.createFromHexString(str);

let _db = null;

async function connect() {
    if (!_db) {
        const dbUrl = process.env.DB_URL;
        const dbName = process.env.DB_NAME;
        
        if (!dbUrl) {
            throw new Error('DB_URL environment variable is not set');
        }
        if (!dbName) {
            throw new Error('DB_NAME environment variable is not set');
        }
        
        try {
            const client = await MongoClient.connect(dbUrl);
            _db = client.db(dbName);
            console.log(`Connected to database: ${dbName}`);
            debugDb('Connected.');
        } catch (err) {
            console.error('Database connection error:', err.message);
            debugDb('Connection failed:', err);
            throw new Error(`Failed to connect to database: ${err.message}`);
        }
    }
    return _db;
}

async function ping() {
    const db = await connect();
    await db.command({ ping: 1 });
    debugDb('Ping.');
}


export {
    newId,
    connect,
    ping,
};

