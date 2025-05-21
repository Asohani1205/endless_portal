require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
    try {
        console.log('Attempting to connect to MongoDB...');
        console.log('Connection URI:', process.env.MONGODB_URI);
        
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        console.log('Successfully connected to MongoDB!');
        console.log('Host:', conn.connection.host);
        console.log('Database:', conn.connection.name);
        
        // Test a simple operation
        const collections = await conn.connection.db.listCollections().toArray();
        console.log('Available collections:', collections.map(c => c.name));
        
        process.exit(0);
    } catch (error) {
        console.error('Connection Error:', error.message);
        process.exit(1);
    }
}

testConnection(); 