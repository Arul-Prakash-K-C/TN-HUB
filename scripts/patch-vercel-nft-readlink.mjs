import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const nftFsPath = require.resolve('@vercel/nft/out/fs.js');
const source = readFileSync(nftFsPath, 'utf8');
const target = "e.code !== 'EINVAL' && e.code !== 'ENOENT' && e.code !== 'UNKNOWN'";
const replacement =
  "e.code !== 'EINVAL' && e.code !== 'ENOENT' && e.code !== 'UNKNOWN' && e.code !== 'EPERM' && e.code !== 'EACCES'";

if (source.includes(replacement)) {
  process.exit(0);
}

if (!source.includes(target)) {
  throw new Error(`Unable to patch @vercel/nft readlink handling at ${nftFsPath}`);
}

writeFileSync(nftFsPath, source.replace(target, replacement));
