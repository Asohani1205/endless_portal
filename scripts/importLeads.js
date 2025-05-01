const ExcelJS = require('exceljs');
const mongoose = require('mongoose');
const Lead = require('../models/Lead');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/admin_portal', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Function to get random source
function getRandomSource() {
    const sources = ['Facebook', 'Instagram', 'LinkedIn', 'Google', 'Website'];
    return sources[Math.floor(Math.random() * sources.length)];
}

// Function to get random price
function getRandomPrice() {
    const priceRanges = [
        { min: 2000000, max: 5000000 },    // 20L - 50L
        { min: 5000000, max: 10000000 },   // 50L - 1Cr
        { min: 10000000, max: 20000000 },  // 1Cr - 2Cr
        { min: 20000000, max: 50000000 },  // 2Cr - 5Cr
        { min: 50000000, max: 100000000 }  // 5Cr - 10Cr
    ];
    const range = priceRanges[Math.floor(Math.random() * priceRanges.length)];
    return Math.floor(Math.random() * (range.max - range.min + 1) + range.min);
}

// Function to get random property type
function getRandomPropertyType() {
    const types = ['Apartment', 'Villa', 'Plot', 'Independent House', 'Commercial'];
    return types[Math.floor(Math.random() * types.length)];
}

// Function to get random locality
function getRandomLocality() {
    const localities = [
        'Vijay Nagar', 'Palasia', 'Bypass Road', 'Rau', 'LIG Colony',
        'Scheme 54', 'Scheme 78', 'MR 10', 'AB Road', 'Nipania'
    ];
    return localities[Math.floor(Math.random() * localities.length)];
}

async function importLeadsFromExcel(filePath) {
    try {
        console.log('Reading Excel file...');
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(filePath);
        const worksheet = workbook.getWorksheet(1);
        
        if (!worksheet) {
            throw new Error('No worksheet found in Excel file');
        }

        console.log('Processing data...');
        const leads = [];
        const seenNames = new Set();
        
        // Skip the header row and read data
        for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
            const row = worksheet.getRow(rowNumber);
            
            // Get values from cells
            const name = row.getCell(1).text || '';
            const mobile = row.getCell(2).text || '';
            const address = row.getCell(3).text || '';
            const city = row.getCell(4).text || 'Indore';

            // Only add if name and mobile exist and name hasn't been seen before
            if (name && mobile && !seenNames.has(name)) {
                seenNames.add(name);
                
                const lead = {
                    name: name.trim(),
                    mobile: mobile.toString().trim(),
                    address: address.trim(),
                    city: city.trim(),
                    source: getRandomSource(),
                    status: 'New',
                    priority: 'Medium',
                    price: getRandomPrice(),
                    propertyType: getRandomPropertyType(),
                    locality: getRandomLocality(),
                    timestamp: new Date()
                };

                leads.push(lead);
            }
        }

        if (leads.length === 0) {
            throw new Error('No valid leads found in Excel file');
        }

        // Save to MongoDB
        console.log('Saving leads to MongoDB...');
        await Lead.deleteMany({}); // Clear existing leads
        await Lead.insertMany(leads);
        
        console.log(`Successfully imported ${leads.length} leads`);
        process.exit(0);
    } catch (error) {
        console.error('Error importing leads:', error);
        process.exit(1);
    }
}

// Get file path from command line argument
const filePath = process.argv[2];
if (!filePath) {
    console.error('Please provide the path to the Excel file');
    process.exit(1);
}

importLeadsFromExcel(filePath); 