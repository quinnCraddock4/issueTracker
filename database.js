import * as dotenv from 'dotenv';
dotenv.config();

import { MongoClient, ObjectId } from "mongodb";
import debug from 'debug';
const debugDb = debug('app:Database');

/** Generate/Parse an ObjectId */
const newId = (str) => ObjectId.createFromHexString(str);

/** Global variable storing the open connection, do not use it directly. */
let _db = null;

/** Connect to the database */
async function connect() {
    if (!_db) {
        const dbUrl = process.env.DB_URL;
        const dbName = process.env.DB_NAME;
        const client = await MongoClient.connect(dbUrl);
        _db = client.db(dbName);
        console.log(`Connected to database: ${dbName}`);
        debugDb('Connected.');
    }
    return _db;
}

/** Connect to the database and verify the connection */
async function ping() {
    const db = await connect();
    await db.command({ ping: 1 });
    debugDb('Ping.');
}

// FIXME: add more functions here

// export functions
export {
    newId,
    connect,
    ping,
    // FIXME: remember to export your functions
};

// test the database connection
// ping(); // Commented out for deployment
