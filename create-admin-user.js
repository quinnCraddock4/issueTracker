import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const dbUrl = process.env.DB_URL;
const dbName = process.env.DB_NAME;

const ADMIN_EMAIL = 'goquinm@gmail.com';
const ADMIN_PASSWORD = 'Goquinn439!';
const ADMIN_GIVEN_NAME = 'Admin';
const ADMIN_FAMILY_NAME = 'User';

async function createAdminUser() {
    const client = await MongoClient.connect(dbUrl);
    const db = client.db(dbName);

    try {
        console.log('Creating admin user with all roles...');

        // Check if user already exists
        const existingUser = await db.collection('users').findOne({ email: ADMIN_EMAIL });
        if (existingUser) {
            console.log(`User with email ${ADMIN_EMAIL} already exists. Updating roles...`);
            
            const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
            const allRoles = ['Developer', 'Business Analyst', 'Quality Analyst', 'Product Manager', 'Technical Manager'];
            
            await db.collection('users').updateOne(
                { email: ADMIN_EMAIL },
                {
                    $set: {
                        password: hashedPassword,
                        role: allRoles,
                        givenName: ADMIN_GIVEN_NAME,
                        familyName: ADMIN_FAMILY_NAME,
                        fullName: `${ADMIN_GIVEN_NAME} ${ADMIN_FAMILY_NAME}`,
                        lastUpdatedOn: new Date()
                    }
                }
            );
            
            console.log(`✓ Updated user ${ADMIN_EMAIL} with all roles`);
        } else {
            const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
            const allRoles = ['Developer', 'Business Analyst', 'Quality Analyst', 'Product Manager', 'Technical Manager'];
            
            const newUser = {
                email: ADMIN_EMAIL,
                password: hashedPassword,
                givenName: ADMIN_GIVEN_NAME,
                familyName: ADMIN_FAMILY_NAME,
                fullName: `${ADMIN_GIVEN_NAME} ${ADMIN_FAMILY_NAME}`,
                role: allRoles,
                createdOn: new Date(),
                lastUpdatedOn: new Date(),
                lastUpdatedBy: null
            };

            const result = await db.collection('users').insertOne(newUser);
            console.log(`✓ Created admin user with ID: ${result.insertedId}`);
        }

        console.log(`\nAdmin account created/updated:`);
        console.log(`  Email: ${ADMIN_EMAIL}`);
        console.log(`  Password: ${ADMIN_PASSWORD}`);
        console.log(`  Roles: Developer, Business Analyst, Quality Analyst, Product Manager, Technical Manager`);
        
    } catch (error) {
        console.error('Error creating admin user:', error);
        throw error;
    } finally {
        await client.close();
        console.log('\nDatabase connection closed.');
    }
}

createAdminUser().catch(console.error);

