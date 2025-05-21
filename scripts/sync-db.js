const mongoose = require('mongoose');
const Lead = require('../models/Lead');
require('dotenv').config();

// Function to connect to a database
async function connectToDB(uri) {
    try {
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log(`Connected to database`);
    } catch (error) {
        console.error(`Error connecting to database: ${error.message}`);
        process.exit(1);
    }
}

// Function to sync data from source to target
async function syncData(sourceUri, targetUri) {
    // Connect to source database
    await connectToDB(sourceUri);
    const sourceLeads = await Lead.find({});
    console.log(`Found ${sourceLeads.length} leads in source database`);
    
    // Connect to target database
    await connectToDB(targetUri);
    
    // Clear existing data in target
    await Lead.deleteMany({});
    console.log('Cleared existing data in target database');
    
    // Insert new data
    await Lead.insertMany(sourceLeads);
    console.log(`Successfully synced ${sourceLeads.length} leads to target database`);
    
    // Close connections
    await mongoose.disconnect();
}

// Get database URIs from command line arguments or environment variables
const sourceUri = process.argv[2] || process.env.LOCAL_MONGODB_URI;
const targetUri = process.argv[3] || process.env.PRODUCTION_MONGODB_URI;

if (!sourceUri || !targetUri) {
    console.error('Please provide both source and target MongoDB URIs');
    console.error('Usage: node sync-db.js <source-uri> <target-uri>');
    process.exit(1);
}

// Run the sync
syncData(sourceUri, targetUri)
    .then(() => {
        console.log('Sync completed successfully');
        process.exit(0);
    })
    .catch(error => {
        console.error('Error during sync:', error);
        process.exit(1);
    }); 