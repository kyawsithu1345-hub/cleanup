const sdk = require('node-appwrite');

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
        // Query ကို variable တစ်ခုအနေနဲ့ အရင်ထုတ်လိုက်တာက ပိုစိတ်ချရပါတယ်
        const queries = [
            sdk.Query.lessThan('$createdAt', isoDate)
        ];

        const response = await databases.listDocuments(
            process.env.DB_ID,
            process.env.COLLECTION_ID,
            queries
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
        // Error message အပြည့်အစုံကို မြင်ရအောင် စစ်ပါမယ်
        console.error("Detailed Error:", error);
        process.exit(1);
    }
}

deleteOldPosts();