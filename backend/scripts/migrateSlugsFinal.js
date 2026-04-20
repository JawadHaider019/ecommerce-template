import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, unique: true, index: true }
}, { strict: false }); // Allow other fields

// Helper to generate slug
const generateSlug = (text) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-');
};

const runMigration = async () => {
    try {
        const { MONGODB_URI, DB_NAME } = process.env;
        console.log(`Connecting to ${DB_NAME}...`);

        await mongoose.connect(MONGODB_URI, {
            dbName: DB_NAME
        });

        console.log('Connected!');

        const Product = mongoose.models.product || mongoose.model('product', productSchema);
        const products = await Product.find({});

        console.log(`Found ${products.length} products total.`);

        let updatedCount = 0;
        for (const product of products) {
            console.log(`Checking: ${product.name} (id: ${product._id})`);

            // Generate slug if missing or empty
            if (!product.slug) {
                const slug = generateSlug(product.name);

                // Ensure unique slug
                let uniqueSlug = slug;
                let counter = 1;
                while (await Product.findOne({ slug: uniqueSlug, _id: { $ne: product._id } })) {
                    uniqueSlug = `${slug}-${counter}`;
                    counter++;
                }

                await Product.updateOne({ _id: product._id }, { $set: { slug: uniqueSlug } });
                console.log(`  Updated: ${uniqueSlug}`);
                updatedCount++;
            } else {
                console.log(`  Already has slug: ${product.slug}`);
            }
        }

        console.log(`Migration finished. Updated ${updatedCount} products.`);
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

runMigration();
