const { Client, Databases, Query } = require('node-appwrite');

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT)
    .setKey(process.env.APPWRITE_KEY);

const databases = new Databases(client);

async function deleteOldPosts() {
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    const isoDate = fourteenDaysAgo.toISOString();

    console.log(`Searching for data older than: ${isoDate}`);

    try {
        // query ကို listDocuments ထဲမှာ တိုက်ရိုက်ထည့်သုံးပါမယ်
        const response = await databases.listDocuments(
            process.env.DB_ID,
            process.env.COLLECTION_ID,
            [
                Query.lessThan('$createdAt', isoDate)
            ]
        );

        if (response.documents.length === 0) {
            console.log("No old data found.");
            return;
        }

        console.log(`Found ${response.documents.length} items. Deleting...`);

        for (const doc of response.documents) {
            await databases.deleteDocument(
                process.env.DB_ID, 
                process.env.COLLECTION_ID, 
                doc.$id
            );
            console.log(`Deleted ID: ${doc.$id}`);
        }
        console.log("Cleanup process completed!");
    } catch (error) {
        console.error("Operation Failed:", error.message);
        process.exit(1);
    }
}

deleteOldPosts();