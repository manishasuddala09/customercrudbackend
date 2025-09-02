// const DB_PATH = path.join(__dirname, 'database', 'customer_management.db');

// const dbExists = fs.existsSync(DB_PATH);

// const db = new sqlite3.Database(DB_PATH, (err) => {
//   if (err) {
//     console.error('Could not connect to database', err);
//   } else {
//     console.log('Connected to SQLite database');
//     if (!dbExists) {
//       const initSQL = fs.readFileSync(path.join(__dirname, 'migrations', 'init.sql'), 'utf-8');
//       db.exec(initSQL, (initErr) => {
//         if (initErr) console.error('Failed to initialize database:', initErr);
//         else console.log('Database initialized successfully');
//       });
//     }
//   }
// });

// module.exports = db;
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Ensure database directory exists
const dbDir = path.join(__dirname, 'database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const DB_PATH = path.join(__dirname, 'database', 'customer_management.db');
const dbExists = fs.existsSync(DB_PATH);

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Could not connect to database', err);
  } else {
    console.log('Connected to SQLite database');
    
    // Always run schema initialization
    initializeSchema();
  }
});

function initializeSchema() {
  try {
    const initSqlPath = path.join(__dirname, 'database', 'init.sql');
    
    if (!fs.existsSync(initSqlPath)) {
      console.error('database file not found:', initSqlPath);
      return;
    }
    
    const initSql = fs.readFileSync(initSqlPath, 'utf-8');
    
    db.exec(initSql, (initErr) => {
      if (initErr) {
        console.error('Failed to initialize database schema:', initErr);
      } else {
        console.log('Database schema initialized successfully');
        
        // Verify tables were created
        verifyTables();
      }
    });
  } catch (error) {
    console.error('Error reading migration file:', error);
  }
}

function verifyTables() {
  db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
    if (err) {
      console.error('Error verifying tables:', err);
    } else {
      console.log('Available tables:', tables.map(t => t.name));
    }
  });
}

module.exports = db;
