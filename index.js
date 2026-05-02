const sdk = require('node-appwrite');

// GitHub Secrets ကနေ data တွေကို ဆွဲယူမယ်
const client = new sdk.Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT) 
    .setProject(process.env.APPWRITE_PROJECT)
    .setKey(process.env.APPWRITE_KEY);

const databases = new sdk.Databases(client);

async function deleteOldPosts() {
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    const isoDate = fourteenDaysAgo.toISOString();

    console.log(`Checking for posts older than: ${isoDate}`);

    try {
        const response = await databases.listDocuments(
            process.env.DB_ID,
            process.env.COLLECTION_ID,
            [sdk.Query.lessThan('$createdAt', isoDate)]
        );

        if (response.documents.length === 0) {
            console.log("No old posts found.");
            return;
        }

        for (const doc of response.documents) {
            await databases.deleteDocument(
                process.env.DB_ID, 
                process.env.COLLECTION_ID, 
                doc.$id
            );
            console.log(`Deleted post ID: ${doc.$id}`);
        }
        console.log("Cleanup finished successfully!");
    } catch (error) {
        console.error("Error during cleanup:", error.message);
        process.exit(1); 
    }
}

deleteOldPosts();