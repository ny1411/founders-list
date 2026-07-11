import { scrapeYC } from './yc';

async function main() {
  console.log("Starting full portfolio scrape...");
  
  try { await scrapeYC(); } catch (e) { console.error("YC scrape failed", e); }
  
  console.log("Finished all scrapes!");
}

if (require.main === module) {
  main().catch(console.error);
}
