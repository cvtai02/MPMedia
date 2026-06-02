// Smoke tests for auth, upload, download, cache, labels, backup
// Run against a running app instance

const BASE_URL = process.env.API_URL ?? 'http://localhost:3000';

async function main() {
  console.log(`Running smoke tests against ${BASE_URL}`);
  // TODO: implement smoke tests per phase
}

main().catch(console.error);
