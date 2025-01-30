import dotenv from 'dotenv';
import express from 'express';
import userRoutes from './routes/user.js';
import categoryRoutes from './routes/category.js';
import productRoutes from './routes/product.js';

configDotenv.config();

const app = express();

app.use(express.json());

// Routes
app.use('/user',userRoutes)
app.use('/category',categoryRoutes)
app.use('/product',productRoutes)

const start = async () => {
    try {
        app.listen({port:3000,host:"0.0.0.0"},(err,addr)=> {
            if(err) {
                console.log("Error in starting server -> ", err);
            }
            console.log(`Server started at http://localhost:3000`);

        } )
    } catch (error) {
        console.log("Error nStarting Server -> ", error);
    }
}

start();