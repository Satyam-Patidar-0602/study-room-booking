const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file path
const dbPath = path.join(__dirname, 'database.sqlite');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
});

// Function to clean all data from database
const cleanupDatabase = () => {
  // List of tables to clean
  const tables = ['bookings', 'users', 'seats'];
  
  // Clean each table
  tables.forEach((table, index) => {
    db.run(`DELETE FROM ${table}`, (err) => {
      if (err) {
        console.error(`❌ Error cleaning ${table}:`, err.message);
      } else {
        // console.log(`✅ Cleaned ${table} table`);
      }
      
      // Check if this is the last table
      if (index === tables.length - 1) {
        // Reset auto-increment counters
        db.run("DELETE FROM sqlite_sequence", (err) => {
          if (err) {
            console.error('❌ Error resetting auto-increment:', err.message);
          } else {
            // console.log('✅ Reset auto-increment counters');
          }
          
          // Close database connection
          db.close((err) => {
            if (err) {
              console.error('Error closing database:', err.message);
            } else {
              // console.log('\n🎉 Database cleanup completed successfully!');
              // console.log('📊 All data has been removed from:');
              // console.log('   - bookings table');
              // console.log('   - users table'); 
              // console.log('   - seats table');
              // console.log('\n💡 The database structure remains intact.');
              // console.log('💡 You can now start fresh with new bookings.');
            }
          });
        });
      }
    });
  });
};

// Run cleanup
cleanupDatabase(); 