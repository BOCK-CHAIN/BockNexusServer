import mangoose from 'mongoose';

const connectDB = (url) => {
    return mangoose.connect(url);
};

export default connectDB;