import { scrapeYC } from './yc';
import { scrapeA16Z } from './a16z';
import { scrape406 } from './406ventures';
import { scrapeGruhas } from './gruhas';

async function main() {
  console.log("Starting full portfolio scrape...");
  
  await scrapeYC();
  await scrapeA16Z();
  await scrape406();
  await scrapeGruhas();
  
  console.log("Finished all scrapes!");
}

main().catch(console.error);
