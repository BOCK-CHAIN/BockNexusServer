import mongoose, { Schema } from "mongoose";
const ProductSchema = new Schema({
    name: { type: String, required: true },
    image_uri: { type: String, required: true },
    price: { type: Number, required: true },
    ar_uri: { type: String },
    description: { type: String },
    category: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});
const Product = mongoose.model("Product", ProductSchema);
export default Product;