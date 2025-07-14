const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database file in the backend directory
const dbPath = path.join(__dirname, 'database.sqlite');

// Create a new database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Create tables
const createTables = () => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating users table:', err.message);
    } else {
      console.log('Users table created successfully.');
    }
  });

  // Seats table
  db.run(`
    CREATE TABLE IF NOT EXISTS seats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      seat_number INTEGER UNIQUE NOT NULL,
      column_number INTEGER NOT NULL,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating seats table:', err.message);
    } else {
      console.log('Seats table created successfully.');
    }
  });

  // Bookings table
  db.run(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      seat_id INTEGER,
      start_date DATE NOT NULL,
      start_time TIME,
      duration_type TEXT NOT NULL CHECK(duration_type IN ('4hours', 'fulltime')),
      subscription_period TEXT NOT NULL CHECK(subscription_period IN ('0.5', '1')),
      total_amount DECIMAL(10,2) NOT NULL,
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'cancelled', 'completed')),
      payment_status TEXT DEFAULT 'pending' CHECK(payment_status IN ('pending', 'paid', 'failed')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (seat_id) REFERENCES seats (id)
    )
  `, (err) => {
    if (err) {
      console.error('Error creating bookings table:', err.message);
    } else {
      console.log('Bookings table created successfully.');
    }
  });

  // Insert default seats (22 seats as per the frontend)
  const insertDefaultSeats = () => {
    const seats = [];
    // Column 1: Seats 1-11
    for (let i = 1; i <= 11; i++) {
      seats.push([i, 1]);
    }
    // Column 2: Seats 12-22
    for (let i = 12; i <= 22; i++) {
      seats.push([i, 2]);
    }

    const stmt = db.prepare('INSERT OR IGNORE INTO seats (seat_number, column_number) VALUES (?, ?)');
    seats.forEach(seat => {
      stmt.run(seat, (err) => {
        if (err) {
          console.error('Error inserting seat:', err.message);
        }
      });
    });
    stmt.finalize((err) => {
      if (err) {
        console.error('Error finalizing seat insertions:', err.message);
      } else {
        console.log('Default seats inserted successfully.');
      }
    });
  };

  // Insert some sample bookings for demonstration
  const insertSampleBookings = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

    const sampleBookings = [
      // Today's bookings
      [1, 1, today.toISOString().split('T')[0], '09:00', '4hours', '1', 300, 'active', 'paid'],
      [1, 3, today.toISOString().split('T')[0], '14:00', '4hours', '0.5', 300, 'active', 'paid'],
      [1, 7, today.toISOString().split('T')[0], '16:00', '4hours', '1', 300, 'active', 'paid'],
      [1, 12, today.toISOString().split('T')[0], '10:00', '4hours', '0.5', 300, 'active', 'paid'],
      [1, 18, today.toISOString().split('T')[0], '19:00', '4hours', '1', 300, 'active', 'paid'],
      [1, 22, today.toISOString().split('T')[0], '08:00', '4hours', '0.5', 300, 'active', 'paid'],
      
      // Tomorrow's bookings
      [1, 2, tomorrow.toISOString().split('T')[0], '08:00', '4hours', '1', 300, 'active', 'paid'],
      [1, 5, tomorrow.toISOString().split('T')[0], '15:00', '4hours', '0.5', 300, 'active', 'paid'],
      [1, 9, tomorrow.toISOString().split('T')[0], '12:00', '4hours', '1', 300, 'active', 'paid'],
      [1, 15, tomorrow.toISOString().split('T')[0], '18:00', '4hours', '0.5', 300, 'active', 'paid'],
      [1, 20, tomorrow.toISOString().split('T')[0], '10:00', '4hours', '1', 300, 'active', 'paid'],
      
      // Day after tomorrow's bookings
      [1, 4, dayAfterTomorrow.toISOString().split('T')[0], '09:00', '4hours', '0.5', 300, 'active', 'paid'],
      [1, 8, dayAfterTomorrow.toISOString().split('T')[0], '14:00', '4hours', '1', 300, 'active', 'paid'],
      [1, 11, dayAfterTomorrow.toISOString().split('T')[0], '16:00', '4hours', '0.5', 300, 'active', 'paid'],
      [1, 16, dayAfterTomorrow.toISOString().split('T')[0], '11:00', '4hours', '1', 300, 'active', 'paid'],
      [1, 21, dayAfterTomorrow.toISOString().split('T')[0], '13:00', '4hours', '0.5', 300, 'active', 'paid'],
    ];

    // First, create a sample user
    db.run(`
      INSERT OR IGNORE INTO users (id, name, email, phone) 
      VALUES (1, 'Sample User', 'sample@example.com', '1234567890')
    `, (err) => {
      if (err) {
        console.error('Error creating sample user:', err.message);
      } else {
        console.log('Sample user created successfully.');
        
        // Now insert sample bookings
        const stmt = db.prepare(`
          INSERT OR IGNORE INTO bookings 
          (user_id, seat_id, start_date, start_time, duration_type, subscription_period, total_amount, status, payment_status) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        sampleBookings.forEach(booking => {
          stmt.run(booking, (err) => {
            if (err) {
              console.error('Error inserting sample booking:', err.message);
            }
          });
        });
        
        stmt.finalize((err) => {
          if (err) {
            console.error('Error finalizing sample booking insertions:', err.message);
          } else {
            console.log('Sample bookings inserted successfully.');
          }
        });
      }
    });
  };

  // Wait a bit for tables to be created, then insert data
  setTimeout(() => {
    insertDefaultSeats();
    setTimeout(() => {
      insertSampleBookings();
      setTimeout(() => {
        console.log('Database initialization completed successfully!');
        db.close((err) => {
          if (err) {
            console.error('Error closing database:', err.message);
          } else {
            console.log('Database connection closed.');
          }
        });
      }, 1000);
    }, 1000);
  }, 1000);
};

createTables(); 