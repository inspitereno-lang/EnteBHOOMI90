/**
 * Fix MongoDB Index Issue - Drop old contact.email_1 index
 * 
 * This script connects directly to MongoDB and drops the problematic index
 * Run: node fixDatabaseIndex.js
 */

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

async function fixIndex() {
    const uri = process.env.MONGOURI; // Fixed: was MONGO_URI

    if (!uri) {
        console.error('❌ Error: MONGOURI not found in .env file');
        process.exit(1);
    }

    const client = new MongoClient(uri);

    try {
        console.log('🔌 Connecting to MongoDB...');
        await client.connect();
        console.log('✅ Connected successfully!');

        const db = client.db('test'); // Database name
        const collection = db.collection('stores');

        // List current indexes
        console.log('\n📋 Current indexes on stores collection:');
        const indexes = await collection.indexes();
        indexes.forEach(index => {
            console.log(`  - ${index.name}`);
        });

        // Check if problematic index exists
        const hasOldIndex = indexes.some(idx => idx.name === 'contact.email_1');

        if (hasOldIndex) {
            console.log('\n🔧 Dropping "contact.email_1" index...');
            await collection.dropIndex('contact.email_1');
            console.log('✅ Index dropped successfully!');
        } else {
            console.log('\n✅ No problematic index found. Database is clean!');
        }

        // Show remaining indexes
        console.log('\n📋 Final indexes:');
        const finalIndexes = await collection.indexes();
        finalIndexes.forEach(index => {
            console.log(`  - ${index.name}`);
        });

        console.log('\n✨ Done! You can now signup with any email address.');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    } finally {
        await client.close();
        console.log('👋 Disconnected from MongoDB\n');
    }
}

fixIndex();
