import dotenv from "dotenv";
import mangoose, {Types} from "mongoose";
import Product from "./models/product";
import Category from "./models/category";
import { categoriesData, productData } from "./seedData";
import mongoose from "mongoose";

dotenv.config();

async function seedDatabase() {
    try {
        await mongoose.connect(process.env.MONGO_URI) 
        await Product.deleteMany({});
        await Category.deleteMany({});

        const categories = await Category.insertMany(categoriesData);
        
        const categoryMap = categoryDocs.reduce((map, category)=>{ 
            map [category.name]=category._id; 
            return map 
            }) 
            const productWithCategoryIds = productData.map((product)=>({ 
                ...product, 
                category: categoryMap[product.category] 
            }))

            await Product.insertMany(productWithCategoryIds);

        console.log("DATABASE SEEDED SUCCESSFULLY");
    } catch (error) {
        console.log("Error in seeding database -> ", error);
    }finally {
        mongoose.connection.close();
    }
}

seedDatabase()