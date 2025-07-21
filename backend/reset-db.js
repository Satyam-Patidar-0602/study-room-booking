const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Database file path
const dbPath = path.join(__dirname, 'database.sqlite');

// Function to completely reset database
const resetDatabase = () => {
  // Check if database file exists
  if (fs.existsSync(dbPath)) {
    // Close any existing connections and delete the file
    try {
      // Delete the database file
      fs.unlinkSync(dbPath);
    } catch (err) {
      console.error('❌ Error deleting database file:', err.message);
      console.log('💡 Make sure no other processes are using the database');
      process.exit(1);
    }
  } else {
    console.log('📁 No existing database file found');
  }

  // Create a new database
  console.log('🏗️  Creating fresh database...');
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('❌ Error creating database:', err.message);
      process.exit(1);
    }
    console.log('✅ New database created successfully');
    
    // Create tables
    console.log('📋 Creating database tables...');
    
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) {
        console.error('❌ Error creating users table:', err.message);
      } else {
        console.log('✅ Users table created');
      }
    });

    // Seats table
    db.run(`CREATE TABLE IF NOT EXISTS seats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      seat_number INTEGER UNIQUE NOT NULL,
      status TEXT DEFAULT 'available',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) {
        console.error('❌ Error creating seats table:', err.message);
      } else {
        console.log('✅ Seats table created');
      }
    });

    // Bookings table
    db.run(`CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      seat_id INTEGER NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      duration TEXT NOT NULL,
      subscription_period TEXT NOT NULL,
      total_amount DECIMAL(10,2) NOT NULL,
      payment_status TEXT DEFAULT 'pending',
      payment_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (seat_id) REFERENCES seats (id)
    )`, (err) => {
      if (err) {
        console.error('❌ Error creating bookings table:', err.message);
      } else {
        console.log('✅ Bookings table created');
      }
    });

    // Insert default seats
    console.log('🪑 Inserting default seats...');
    const seatNumbers = Array.from({length: 22}, (_, i) => i + 1);
    const seatValues = seatNumbers.map(num => `(${num}, 'available')`).join(', ');
    
    db.run(`INSERT OR IGNORE INTO seats (seat_number, status) VALUES ${seatValues}`, (err) => {
      if (err) {
        console.error('❌ Error inserting seats:', err.message);
      } else {
        console.log(`✅ Inserted ${seatNumbers.length} default seats`);
      }
      
      // Close database connection
      db.close((err) => {
        if (err) {
          console.error('Error closing database:', err.message);
        } else {
          console.log('\n🎉 Database reset completed successfully!');
          console.log('📊 Fresh database created with:');
          console.log('   - Empty users table');
          console.log('   - Empty bookings table');
          console.log('   - 22 available seats');
          console.log('\n💡 You can now start fresh with new bookings.');
        }
      });
    });
  });
};

// Run reset
resetDatabase(); 