const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection(uri) {
    try {
        console.log('Attempting to connect to:', uri);
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Successfully connected to MongoDB!');
        
        // Test a simple operation
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Available collections:', collections.map(c => c.name));
        
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        process.exit(1);
    }
}

// Test local connection
console.log('\nTesting local connection...');
testConnection(process.env.LOCAL_MONGODB_URI)
    .then(() => {
        // Test Atlas connection
        console.log('\nTesting Atlas connection...');
        return testConnection(process.env.PRODUCTION_MONGODB_URI);
    })
    .catch(error => {
        console.error('Error during testing:', error);
        process.exit(1);
    }); 