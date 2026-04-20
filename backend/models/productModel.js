import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    discountprice: { type: Number, required: true },
    cost: { type: Number, required: true },
    quantity: { type: Number, required: true },
    image: { type: Array, required: true },
    category: {
        type: String,
        required: true,
        ref: 'Category'
    },
    subcategory: {
        type: String,
        required: true
    },

    ingredients: {
        type: [String],
        required: false,
        default: []
    },
    howToUse: {
        type: String,
        required: false,
        default: ""
    },
    benefits: {
        type: [String],
        required: false,
        default: []
    },
    bestseller: { type: Boolean, default: false },
    date: { type: Number, required: true },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived', 'scheduled'],
        default: 'draft'
    },
    totalSales: { type: Number, default: 0 },
    idealStock: { type: Number, default: 20 },
    views: { type: Number, default: 0 },
    // New field to track if notification was sent
    notificationSent: { type: Boolean, default: false },
    slug: { type: String, unique: true, index: true }
});

// Add index for better category queries
productSchema.index({ category: 1 });
productSchema.index({ subcategory: 1 });

// Helper to generate slug
const generateSlug = (text) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')     // Replace spaces with -
        .replace(/[^\w-]+/g, '')  // Remove all non-word chars
        .replace(/--+/g, '-');    // Replace multiple - with single -
};

// Pre-save middleware for product
productSchema.pre('save', async function (next) {
    if (!this.date) {
        this.date = Date.now();
    }

    // Generate slug if it doesn't exist or if name has changed
    if (this.isModified('name') || !this.slug) {
        let baseSlug = generateSlug(this.name);
        let slug = baseSlug;
        let count = 1;

        // Ensure slug uniqueness
        while (true) {
            const existingProduct = await mongoose.models.product.findOne({
                slug,
                _id: { $ne: this._id }
            });

            if (!existingProduct) break;

            slug = `${baseSlug}-${count}`;
            count++;
        }

        this.slug = slug;
    }

    // Ensure discount price is valid
    if (this.discountprice >= this.price) {
        this.discountprice = this.price;
    }

    next();
});

const productModel = mongoose.models.product || mongoose.model("product", productSchema);
export default productModel;