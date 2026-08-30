import { pbkdf2Sync, randomBytes, randomUUID } from 'node:crypto';

const name = process.env.INITIAL_SUPER_ADMIN_NAME;
const email = process.env.INITIAL_SUPER_ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.INITIAL_SUPER_ADMIN_PASSWORD;

if (!name || !email || !password) {
  throw new Error(
    'Set INITIAL_SUPER_ADMIN_NAME, INITIAL_SUPER_ADMIN_EMAIL, and INITIAL_SUPER_ADMIN_PASSWORD.',
  );
}

if (password.length < 12) {
  throw new Error('INITIAL_SUPER_ADMIN_PASSWORD must be at least 12 characters long.');
}

const salt = randomBytes(16);
const hash = pbkdf2Sync(password, salt, 600_000, 32, 'sha256');
const passwordHash = `PBKDF2-SHA256$600000$${salt.toString('base64url')}$${hash.toString('base64url')}`;
const quote = (value) => `'${value.replaceAll("'", "''")}'`;

console.log(
  [
    'INSERT INTO admins (id, email, password_hash, display_name, role, is_active)',
    `VALUES (${quote(randomUUID())}, ${quote(email)}, ${quote(passwordHash)}, ${quote(name)}, 'SUPER_ADMIN', 1);`,
  ].join(' '),
);
