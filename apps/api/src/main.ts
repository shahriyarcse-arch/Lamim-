import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { config as loadDotenv } from 'dotenv';
import { createApp } from './app';
import { ConfigError, loadConfig } from './config';

// Local development: secrets come from the monorepo root .env (src/ and dist/ are both
// three levels below it). Real environment variables always take precedence.
const rootEnv = resolve(import.meta.dirname, '../../../.env');
if (existsSync(rootEnv)) loadDotenv({ path: rootEnv, quiet: true });

async function main(): Promise<void> {
  let config;
  try {
    config = loadConfig();
  } catch (err) {
    if (err instanceof ConfigError) {
      process.stderr.write(`${JSON.stringify({ level: 'error', msg: err.message })}\n`);
      process.exit(1);
    }
    throw err;
  }
  const app = await createApp(config);
  await app.listen(config.PORT);
  process.stdout.write(
    `${JSON.stringify({ level: 'info', msg: 'api.listening', port: config.PORT })}\n`,
  );
}

void main();
