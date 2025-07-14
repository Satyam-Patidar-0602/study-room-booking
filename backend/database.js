const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file path
const dbPath = path.join(__dirname, 'database.sqlite');

// Create database connection
const createConnection = () => {
  return new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
    }
  });
};

// Helper function to run queries with promises
const runQuery = (query, params = []) => {
  return new Promise((resolve, reject) => {
    const db = createConnection();
    db.run(query, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
      db.close();
    });
  });
};

// Helper function to get single row
const getRow = (query, params = []) => {
  return new Promise((resolve, reject) => {
    const db = createConnection();
    db.get(query, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
      db.close();
    });
  });
};

// Helper function to get multiple rows
const getAll = (query, params = []) => {
  return new Promise((resolve, reject) => {
    const db = createConnection();
    db.all(query, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
      db.close();
    });
  });
};

// Helper function to run multiple queries in a transaction
const runTransaction = (queries) => {
  return new Promise((resolve, reject) => {
    const db = createConnection();
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');
      
      const results = [];
      let completed = 0;
      
      queries.forEach((queryObj, index) => {
        db.run(queryObj.query, queryObj.params || [], function(err) {
          if (err) {
            db.run('ROLLBACK');
            db.close();
            reject(err);
            return;
          }
          
          results[index] = { id: this.lastID, changes: this.changes };
          completed++;
          
          if (completed === queries.length) {
            db.run('COMMIT', (err) => {
              if (err) {
                reject(err);
              } else {
                resolve(results);
              }
              db.close();
            });
          }
        });
      });
    });
  });
};

module.exports = {
  createConnection,
  runQuery,
  getRow,
  getAll,
  runTransaction
}; 