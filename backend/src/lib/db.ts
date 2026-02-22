import { hashPassword } from './password'

let initPromise: Promise<void> | null = null

const schemaStatements = [
  `CREATE TABLE IF NOT EXISTS branches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    governorate TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    facebook TEXT,
    telegram TEXT,
    instagram TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('superadmin', 'admin')),
    branch_id INTEGER,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (branch_id) REFERENCES branches (id)
  );`,
  `CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    image_url TEXT NOT NULL,
    announcement TEXT NOT NULL,
    event_date TEXT NOT NULL,
    location TEXT NOT NULL,
    created_by INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (branch_id) REFERENCES branches (id),
    FOREIGN KEY (created_by) REFERENCES users (id)
  );`,
]

const seedBranches = [
  {
    name: 'شؤون الشباب - دمشق',
    governorate: 'دمشق',
    address: 'دمشق - المزة',
    phone: '0933000001',
    whatsapp: '0933000001',
  },
  {
    name: 'شؤون الشباب - حلب',
    governorate: 'حلب',
    address: 'حلب - الجميلية',
    phone: '0933000002',
    whatsapp: '0933000002',
  },
]

export const initializeDatabase = async (db: D1Database) => {
  if (initPromise) {
    return initPromise
  }

  initPromise = (async () => {
    for (const statement of schemaStatements) {
      await db.prepare(statement).run()
    }

    for (const branch of seedBranches) {
      await db
        .prepare(
          `INSERT OR IGNORE INTO branches (
            name,
            governorate,
            address,
            phone,
            whatsapp,
            facebook,
            telegram,
            instagram
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(branch.name, branch.governorate, branch.address, branch.phone, branch.whatsapp, null, null, null)
        .run()
    }

    const superadminExists = await db
      .prepare(`SELECT id FROM users WHERE role = 'superadmin' LIMIT 1`)
      .first<{ id: number }>()

    if (!superadminExists) {
      const passwordHash = await hashPassword('admin123')
      await db
        .prepare(
          `INSERT INTO users (username, display_name, password_hash, role, branch_id)
           VALUES (?, ?, ?, 'superadmin', NULL)`
        )
        .bind('superadmin', 'مدير عام', passwordHash)
        .run()
    }
  })()

  return initPromise
}