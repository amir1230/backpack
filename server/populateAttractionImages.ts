import { storage } from "./storage.js";
import { MediaOrchestrator } from "./integrations/media/mediaOrchestrator.js";

// Create MediaOrchestrator instance
const mediaOrchestrator = new MediaOrchestrator(storage);

async function populateAttractionImages() {
  console.log("🖼️ Starting attraction images population...");

  try {
    // Get all attractions
    const attractions = await storage.getAllAttractions();
    console.log(`📍 Found ${attractions.length} attractions`);

    let successCount = 0;
    let skippedCount = 0;
    let failedCount = 0;

    for (const attraction of attractions) {
      try {
        // Check if already has cached photo
        const existing = await storage.getPrimaryLocationPhoto('attraction', attraction.id);
        
        if (existing) {
          console.log(`⏭️ ${attraction.name} already has image`);
          skippedCount++;
          continue;
        }

        console.log(`\n📸 Fetching image for: ${attraction.name}...`);

        // Fetch and cache image
        const result = await mediaOrchestrator.getLocationPhoto({
          entityType: 'attraction',
          entityId: attraction.id,
          entityName: attraction.name,
          forceRefresh: false
        });

        console.log(`✅ Image cached from ${result.source}: ${attraction.name}`);
        successCount++;

      } catch (error: any) {
        console.error(`❌ Failed for ${attraction.name}:`, error.message);
        failedCount++;
      }
    }

    console.log(`\n✅ Population complete!`);
    console.log(`   Success: ${successCount}`);
    console.log(`   Skipped: ${skippedCount}`);
    console.log(`   Failed: ${failedCount}`);
    console.log(`   Total: ${attractions.length}`);

  } catch (error) {
    console.error("❌ Error populating attraction images:", error);
    throw error;
  }
}

// Run the script
populateAttractionImages()
  .then(() => {
    console.log("✅ Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
