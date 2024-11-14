import { createClient } from '@libsql/client';

const db = createClient({
  url: 'file:kafet.db',
});

async function setup() {
  // Create users table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      role TEXT CHECK(role IN ('admin', 'user')) NOT NULL DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create menus table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS menus (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date DATE NOT NULL,
      type TEXT CHECK(type IN ('entree', 'plat', 'dessert')) NOT NULL,
      name TEXT NOT NULL,
      photo_url TEXT NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      quota INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(date, type)
    )
  `);

  // Create reservations table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS reservations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      menu_id INTEGER NOT NULL,
      status TEXT CHECK(status IN ('pending', 'confirmed', 'cancelled')) NOT NULL DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (menu_id) REFERENCES menus(id)
    )
  `);

  // Insert default admin user
  await db.execute(`
    INSERT OR IGNORE INTO users (email, password_hash, first_name, last_name, role)
    VALUES ('admin@kafet.com', 'admin123', 'Admin', 'User', 'admin')
  `);

  // Insert default regular user
  await db.execute(`
    INSERT OR IGNORE INTO users (email, password_hash, first_name, last_name, role)
    VALUES ('user@kafet.com', 'user123', 'Regular', 'User', 'user')
  `);

  console.log('Database setup completed successfully!');
  process.exit(0);
}

setup().catch(err => {
  console.error('Error setting up database:', err);
  process.exit(1);
});