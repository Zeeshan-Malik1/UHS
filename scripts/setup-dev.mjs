import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import crypto from 'node:crypto';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const mysqlExe = existsSync('C:\\xampp\\mysql\\bin\\mysql.exe')
  ? 'C:\\xampp\\mysql\\bin\\mysql.exe'
  : 'mysql';

const databaseUrl = process.env.DATABASE_URL ?? 'mysql://root:@localhost:3306/uhs';
const adminEmail = process.env.ADMIN_SEED_EMAIL ?? 'admin@uhs.local';
const adminPassword = process.env.ADMIN_SEED_PASSWORD ?? crypto.randomBytes(12).toString('base64url');
const accessSecret = process.env.JWT_ACCESS_SECRET ?? crypto.randomBytes(32).toString('base64url');
const refreshSecret = process.env.JWT_REFRESH_SECRET ?? crypto.randomBytes(32).toString('base64url');
const serverEnv = `NODE_ENV=development
PORT=4000
CLIENT_URL=http://localhost:5173
DATABASE_URL=${databaseUrl}
JWT_ACCESS_SECRET=${accessSecret}
JWT_REFRESH_SECRET=${refreshSecret}
ACCESS_TOKEN_MINUTES=60
REFRESH_TOKEN_DAYS=30
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=UHS Care <care@uhs.health>
GOOGLE_MAPS_API_KEY=
UPLOAD_DIR=../uploads
AI_MODEL_URL=
ADMIN_SEED_EMAIL=${adminEmail}
ADMIN_SEED_PASSWORD=${adminPassword}
`;

const rootEnv = `DATABASE_URL=${databaseUrl}
ADMIN_SEED_EMAIL=${adminEmail}
ADMIN_SEED_PASSWORD=${adminPassword}
`;

function ensureFile(path, content) {
  if (!existsSync(path)) writeFileSync(path, content);
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: 'inherit',
    shell: false,
    ...options,
  });
  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }
  if (result.status !== 0) {
    if (options.allowFailure) return result.status;
    process.exit(result.status ?? 1);
  }
  return 0;
}

mkdirSync(join(root, 'uploads'), { recursive: true });
ensureFile(join(root, '.env'), rootEnv);
ensureFile(join(root, 'server', '.env'), serverEnv);

const createDb = spawnSync(mysqlExe, ['-uroot', '-e', 'CREATE DATABASE IF NOT EXISTS `uhs` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;'], {
  cwd: root,
  stdio: 'inherit',
  shell: false,
});

if (createDb.status !== 0) {
  console.error('\nCould not connect to MySQL. Start XAMPP MySQL, then run npm run dev again.');
  process.exit(createDb.status ?? 1);
}

const prismaCli = join(root, 'node_modules', 'prisma', 'build', 'index.js');
const tsxCli = join(root, 'node_modules', 'tsx', 'dist', 'cli.mjs');
const generated = run(process.execPath, [prismaCli, 'generate', '--schema', 'prisma/schema.prisma'], { allowFailure: true });
if (generated !== 0) console.warn('Prisma generate was skipped because the client appears to be locked by a running dev server. Existing client will be used.');
run(process.execPath, [prismaCli, 'db', 'push', '--skip-generate', '--schema', 'prisma/schema.prisma']);
run(process.execPath, [tsxCli, join(root, 'server', 'src', 'database', 'seed.ts')], { cwd: join(root, 'server') });
