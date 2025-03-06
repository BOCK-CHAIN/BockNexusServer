import mongoose, { Schema } from "mongoose";
const CategorySchema = new Schema({
    name: { type: String, required: true},
    image_uri: { type: String, required: true},
    products: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    address: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const Category = mongoose.model("Category", CategorySchema);
export default Category;
