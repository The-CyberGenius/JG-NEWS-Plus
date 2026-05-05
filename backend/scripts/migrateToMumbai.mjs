/**
 * MongoDB Migration Script: Old Cluster → Mumbai Cluster
 *
 * Usage:
 *   1. Set both URIs in .env:
 *      OLD_MONGO_URI=<original cluster connection string with /jg_news_plus>
 *      NEW_MONGO_URI=<mumbai cluster connection string with /jg_news_plus>
 *   2. Run: node backend/scripts/migrateToMumbai.mjs
 *
 * This copies ALL collections from old → new with progress logs.
 * Safe: read-only on old, write-only on new. Old cluster untouched.
 */
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const OLD_URI = process.env.OLD_MONGO_URI || process.env.MONGO_URI;
const NEW_URI = process.env.NEW_MONGO_URI;

if (!OLD_URI || !NEW_URI) {
    console.error('❌ Set both OLD_MONGO_URI and NEW_MONGO_URI in .env');
    console.error('   OLD_MONGO_URI = original connection string');
    console.error('   NEW_MONGO_URI = mumbai cluster connection string');
    process.exit(1);
}

const ensureDbName = (uri) => {
    // Make sure URI has /jg_news_plus database
    if (uri.includes('/jg_news_plus')) return uri;
    if (uri.includes('?')) {
        return uri.replace('?', '/jg_news_plus?');
    }
    return uri.replace(/\/?$/, '/jg_news_plus');
};

const oldUri = ensureDbName(OLD_URI);
const newUri = ensureDbName(NEW_URI);

console.log('🔌 Connecting to OLD cluster...');
const oldClient = new MongoClient(oldUri);
await oldClient.connect();
const oldDb = oldClient.db('jg_news_plus');

console.log('🔌 Connecting to NEW (Mumbai) cluster...');
const newClient = new MongoClient(newUri);
await newClient.connect();
const newDb = newClient.db('jg_news_plus');

console.log('\n📋 Listing collections on OLD cluster...');
const collections = await oldDb.listCollections().toArray();
console.log(`   Found ${collections.length} collections:`);
collections.forEach(c => console.log(`   - ${c.name}`));

console.log('\n🚚 Starting migration...\n');

const summary = [];
for (const { name } of collections) {
    if (name.startsWith('system.')) continue; // skip system collections

    process.stdout.write(`   ${name}: reading...`);
    const docs = await oldDb.collection(name).find({}).toArray();
    process.stdout.write(` ${docs.length} docs ... `);

    if (docs.length > 0) {
        // Drop existing collection on new (so we can re-run safely)
        try { await newDb.collection(name).drop(); } catch (e) { /* not exists */ }
        // Insert in chunks of 500 to avoid memory issues
        const CHUNK = 500;
        for (let i = 0; i < docs.length; i += CHUNK) {
            await newDb.collection(name).insertMany(docs.slice(i, i + CHUNK));
        }
    }
    process.stdout.write('✅\n');
    summary.push({ collection: name, count: docs.length });
}

console.log('\n📊 Migration Summary:');
summary.forEach(s => console.log(`   ✅ ${s.collection.padEnd(20)} ${s.count} docs`));

console.log('\n🔍 Verifying counts on NEW cluster...');
let allMatch = true;
for (const s of summary) {
    const newCount = await newDb.collection(s.collection).countDocuments();
    const match = newCount === s.count;
    if (!match) allMatch = false;
    console.log(`   ${match ? '✅' : '❌'} ${s.collection.padEnd(20)} old=${s.count}  new=${newCount}`);
}

await oldClient.close();
await newClient.close();

console.log('');
if (allMatch) {
    console.log('🎉 MIGRATION SUCCESSFUL!');
    console.log('');
    console.log('NEXT STEPS:');
    console.log('  1. Update Vercel env: MONGO_URI = <NEW_MONGO_URI>');
    console.log('  2. Trigger redeploy on Vercel');
    console.log('  3. Test: open jgnews.live and check it works');
    console.log('  4. Once verified, you can delete the old cluster on Atlas');
} else {
    console.log('⚠️  Some counts mismatch. Re-run script to retry.');
    process.exit(1);
}
