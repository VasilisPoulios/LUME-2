const mongoose = require('mongoose');
const dotenv = require('dotenv');
const readline = require('readline');
const { seedDatabase } = require('./seed');

// Load env vars
dotenv.config();

// Create readline interface for user confirmation
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Connect to MongoDB
const resetDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    // Ask for confirmation
    rl.question('⚠️ WARNING: This will delete ALL data in your database. Are you sure? (yes/no): ', async (answer) => {
      if (answer.toLowerCase() === 'yes') {
        console.log('Resetting database...');
        
        // Get all collections in the database
        const collections = await mongoose.connection.db.collections();
        
        // Drop each collection
        for (const collection of collections) {
          await collection.drop();
          console.log(`Dropped collection: ${collection.collectionName}`);
        }
        
        console.log('All collections dropped successfully!');
        
        // Ask if user wants to reseed the database
        rl.question('Do you want to seed the database with sample data? (yes/no): ', async (seedAnswer) => {
          if (seedAnswer.toLowerCase() === 'yes') {
            await seedDatabase();
          } else {
            console.log('Database has been reset but not reseeded.');
            process.exit(0);
          }
          rl.close();
        });
      } else {
        console.log('Database reset operation canceled.');
        rl.close();
        process.exit(0);
      }
    });
  } catch (error) {
    console.error('Error resetting database:', error);
    rl.close();
    process.exit(1);
  }
};

// Check if we're running this file directly
if (require.main === module) {
  resetDatabase();
}

module.exports = resetDatabase; 