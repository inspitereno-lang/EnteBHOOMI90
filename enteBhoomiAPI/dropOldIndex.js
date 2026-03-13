/**
 * Script to drop the old contact.email index from stores collection
 * 
 * Run this script once to fix the duplicate key error:
 * node dropOldIndex.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const dropOldIndex = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Get the stores collection
        const db = mongoose.connection.db;
        const collection = db.collection('stores');

        // List all indexes
        console.log('\n📋 Current indexes on stores collection:');
        const indexes = await collection.indexes();
        indexes.forEach(index => {
            console.log(`  - ${index.name}:`, JSON.stringify(index.key));
        });

        // Check if the problematic index exists
        const hasContactEmailIndex = indexes.some(idx => idx.name === 'contact.email_1');

        if (hasContactEmailIndex) {
            console.log('\n🔧 Dropping old "contact.email_1" index...');
            await collection.dropIndex('contact.email_1');
            console.log('✅ Successfully dropped the old index!');
        } else {
            console.log('\n✅ The "contact.email_1" index does not exist. Nothing to drop.');
        }

        console.log('\n📋 Remaining indexes:');
        const remainingIndexes = await collection.indexes();
        remainingIndexes.forEach(index => {
            console.log(`  - ${index.name}:`, JSON.stringify(index.key));
        });

        console.log('\n✨ Done! You can now signup with any email.');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('\n👋 Disconnected from MongoDB');
    }
};

dropOldIndex();
