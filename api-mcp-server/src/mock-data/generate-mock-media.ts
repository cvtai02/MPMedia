// Generates mock media records for development/testing

const BASE_URL = process.env.API_URL ?? 'http://localhost:3000';

async function main() {
  console.log(`Generating mock data against ${BASE_URL}`);
  // TODO: implement mock data generation
}

main().catch(console.error);
