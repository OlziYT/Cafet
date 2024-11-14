import { createClient } from '@libsql/client';

const db = createClient({
  url: 'file:kafet.db',
});

export interface User {
  id: number;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'user';
  created_at: string;
}

export interface Menu {
  id: number;
  date: string;
  type: 'entree' | 'plat' | 'dessert';
  name: string;
  photo_url: string;
  price: number;
  quota: number;
  created_at: string;
}

export interface Reservation {
  id: number;
  user_id: number;
  menu_id: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
}

// Users
export async function createUser(user: Omit<User, 'id' | 'created_at'>) {
  const result = await db.execute({
    sql: `INSERT INTO users (email, password_hash, first_name, last_name, role)
          VALUES (?, ?, ?, ?, ?)`,
    args: [user.email, user.password_hash, user.first_name, user.last_name, user.role]
  });
  return result.lastInsertRowid;
}

export async function getUserByEmail(email: string) {
  const result = await db.execute({
    sql: 'SELECT * FROM users WHERE email = ?',
    args: [email]
  });
  return result.rows[0] as User | undefined;
}

export async function getUserById(id: number) {
  const result = await db.execute({
    sql: 'SELECT * FROM users WHERE id = ?',
    args: [id]
  });
  return result.rows[0] as User | undefined;
}

// Menus
export async function createMenu(menu: Omit<Menu, 'id' | 'created_at'>) {
  const result = await db.execute({
    sql: `INSERT INTO menus (date, type, name, photo_url, price, quota)
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: [menu.date, menu.type, menu.name, menu.photo_url, menu.price, menu.quota]
  });
  return result.lastInsertRowid;
}

export async function getMenusByDate(date: string) {
  const result = await db.execute({
    sql: 'SELECT * FROM menus WHERE date = ? ORDER BY type',
    args: [date]
  });
  return result.rows as Menu[];
}

export async function updateMenu(id: number, menu: Partial<Omit<Menu, 'id' | 'created_at'>>) {
  const sets: string[] = [];
  const args: any[] = [];
  
  Object.entries(menu).forEach(([key, value]) => {
    if (value !== undefined) {
      sets.push(`${key} = ?`);
      args.push(value);
    }
  });
  
  if (sets.length === 0) return;
  
  args.push(id);
  await db.execute({
    sql: `UPDATE menus SET ${sets.join(', ')} WHERE id = ?`,
    args
  });
}

// Reservations
export async function createReservation(reservation: Omit<Reservation, 'id' | 'created_at'>) {
  const result = await db.execute({
    sql: `INSERT INTO reservations (user_id, menu_id, status)
          VALUES (?, ?, ?)`,
    args: [reservation.user_id, reservation.menu_id, reservation.status]
  });
  return result.lastInsertRowid;
}

export async function getReservationsByUser(userId: number) {
  const result = await db.execute({
    sql: `SELECT r.*, m.* 
          FROM reservations r
          JOIN menus m ON r.menu_id = m.id
          WHERE r.user_id = ?
          ORDER BY r.created_at DESC`,
    args: [userId]
  });
  return result.rows as (Reservation & Menu)[];
}

export async function updateReservationStatus(id: number, status: Reservation['status']) {
  await db.execute({
    sql: 'UPDATE reservations SET status = ? WHERE id = ?',
    args: [status, id]
  });
}

export default db;