-- -- Customer Management System Database Schema

-- -- Enable foreign key constraints
-- PRAGMA foreign_keys = ON;

-- -- Create customers table
-- CREATE TABLE IF NOT EXISTS customers (
--     id INTEGER PRIMARY KEY AUTOINCREMENT,
--     first_name TEXT NOT NULL CHECK(length(first_name) >= 2 AND length(first_name) <= 50),
--     last_name TEXT NOT NULL CHECK(length(last_name) >= 2 AND length(last_name) <= 50),
--     phone_number TEXT NOT NULL UNIQUE CHECK(length(phone_number) = 10 AND phone_number GLOB '[0-9]*'),
--     email TEXT UNIQUE CHECK(email IS NULL OR email GLOB '*@*.*'),
--     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
--     updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
-- );

-- -- Create addresses table
-- CREATE TABLE IF NOT EXISTS addresses (
--     id INTEGER PRIMARY KEY AUTOINCREMENT,
--     customer_id INTEGER NOT NULL,
--     address_details TEXT NOT NULL CHECK(length(address_details) >= 10 AND length(address_details) <= 500),
--     city TEXT NOT NULL CHECK(length(city) >= 2 AND length(city) <= 100),
--     state TEXT NOT NULL CHECK(length(state) >= 2 AND length(state) <= 100),
--     pin_code TEXT NOT NULL CHECK(length(pin_code) = 6 AND pin_code GLOB '[0-9]*'),
--     country TEXT DEFAULT 'India' CHECK(length(country) >= 2 AND length(country) <= 100),
--     is_primary BOOLEAN DEFAULT 0,
--     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
--     updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE CASCADE
-- );

-- -- Create indexes for better performance
-- CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone_number);
-- CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
-- CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(first_name, last_name);
-- CREATE INDEX IF NOT EXISTS idx_addresses_customer ON addresses(customer_id);
-- CREATE INDEX IF NOT EXISTS idx_addresses_city ON addresses(city);
-- CREATE INDEX IF NOT EXISTS idx_addresses_state ON addresses(state);
-- CREATE INDEX IF NOT EXISTS idx_addresses_pin ON addresses(pin_code);
-- CREATE INDEX IF NOT EXISTS idx_addresses_primary ON addresses(is_primary);

-- -- Trigger to update updated_at timestamp for customers
-- CREATE TRIGGER IF NOT EXISTS update_customers_timestamp 
-- AFTER UPDATE ON customers
-- BEGIN
--     UPDATE customers SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
-- END;

-- -- Trigger to update updated_at timestamp for addresses
-- CREATE TRIGGER IF NOT EXISTS update_addresses_timestamp 
-- AFTER UPDATE ON addresses
-- BEGIN
--     UPDATE addresses SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
-- END;

-- -- Trigger to ensure only one primary address per customer
-- CREATE TRIGGER IF NOT EXISTS enforce_single_primary_address
-- BEFORE INSERT ON addresses
-- WHEN NEW.is_primary = 1
-- BEGIN
--     UPDATE addresses SET is_primary = 0 WHERE customer_id = NEW.customer_id;
-- END;

-- -- Sample data (optional - for development/testing)
-- INSERT OR IGNORE INTO customers (id, first_name, last_name, phone_number, email) VALUES
-- (1, 'John', 'Doe', '9876543210', 'john.doe@example.com'),
-- (2, 'Jane', 'Smith', '8765432109', 'jane.smith@example.com'),
-- (3, 'Mike', 'Johnson', '7654321098', 'mike.johnson@example.com');

-- INSERT OR IGNORE INTO addresses (customer_id, address_details, city, state, pin_code, is_primary) VALUES
-- (1, '123 Main Street, Apartment 4B', 'Mumbai', 'Maharashtra', '400001', 1),
-- (1, '456 Business District, Office Complex', 'Mumbai', 'Maharashtra', '400020', 0),
-- (2, '789 Garden Lane, Villa 3', 'Bangalore', 'Karnataka', '560001', 1),
-- (3, '321 Tech Park, Building A, Floor 5', 'Hyderabad', 'Telangana', '500032', 1);
-- SQLite database initialization script
-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone_number TEXT NOT NULL UNIQUE,
  email TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Addresses table
CREATE TABLE IF NOT EXISTS addresses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL,
  address_details TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pin_code TEXT NOT NULL,
  country TEXT DEFAULT 'India',
  is_primary BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);
