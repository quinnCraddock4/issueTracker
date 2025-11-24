import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const dbUrl = process.env.DB_URL;
const dbName = process.env.DB_NAME;

async function createIndexes() {
    const client = await MongoClient.connect(dbUrl);
    const db = client.db(dbName);

    console.log('Creating indexes...');

    try {
        // Users collection indexes
        console.log('Creating users collection indexes...');
        const usersCollection = db.collection('users');

        // Wildcard text index for users
        await usersCollection.createIndex({ '$**': 'text' });
        console.log('✓ Created wildcard text index on users');

        // Created date index
        await usersCollection.createIndex({ createdOn: 1 });
        console.log('✓ Created index on users.createdOn');

        // Compound index: givenName, familyName, createdOn
        await usersCollection.createIndex({ givenName: 1, familyName: 1, createdOn: 1 });
        console.log('✓ Created compound index on users (givenName, familyName, createdOn)');

        // Compound index: familyName, givenName, createdOn
        await usersCollection.createIndex({ familyName: 1, givenName: 1, createdOn: 1 });
        console.log('✓ Created compound index on users (familyName, givenName, createdOn)');

        // Compound index: role, givenName, familyName, createdOn
        await usersCollection.createIndex({ role: 1, givenName: 1, familyName: 1, createdOn: 1 });
        console.log('✓ Created compound index on users (role, givenName, familyName, createdOn)');

        // Bugs collection indexes
        console.log('\nCreating bugs collection indexes...');
        const bugsCollection = db.collection('bugs');

        // Wildcard text index for bugs
        await bugsCollection.createIndex({ '$**': 'text' });
        console.log('✓ Created wildcard text index on bugs');

        // Created date index (descending for newest sort)
        await bugsCollection.createIndex({ createdOn: -1 });
        console.log('✓ Created index on bugs.createdOn');

        // Compound index: title, createdOn
        await bugsCollection.createIndex({ title: 1, createdOn: -1 });
        console.log('✓ Created compound index on bugs (title, createdOn)');

        // Compound index: classification, createdOn
        await bugsCollection.createIndex({ classification: 1, createdOn: -1 });
        console.log('✓ Created compound index on bugs (classification, createdOn)');

        // Compound index: assignedToUserName, createdOn
        await bugsCollection.createIndex({ assignedToUserName: 1, createdOn: -1 });
        console.log('✓ Created compound index on bugs (assignedToUserName, createdOn)');

        // Compound index: createdByUserName, createdOn
        await bugsCollection.createIndex({ createdByUserName: 1, createdOn: -1 });
        console.log('✓ Created compound index on bugs (createdByUserName, createdOn)');

        console.log('\n✓ All indexes created successfully!');
    } catch (error) {
        console.error('Error creating indexes:', error);
        // Some indexes might already exist, which is fine
        if (error.code === 85 || error.code === 86) {
            console.log('Note: Some indexes may already exist. This is normal.');
        } else {
            throw error;
        }
    } finally {
        await client.close();
        console.log('Database connection closed.');
    }
}

createIndexes().catch(console.error);

