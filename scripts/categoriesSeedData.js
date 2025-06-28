const categoriesPageData = [
  {
    name: 'Fashion',
    image_uri: 'https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    address: 'Fashion District',
  },
  {
    name: 'Electronics',
    image_uri: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    address: 'Tech Hub',
  },
  {
    name: 'Home & Garden',
    image_uri: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    address: 'Home Improvement Center',
  },
  {
    name: 'Sports',
    image_uri: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    address: 'Sports Complex',
  },
  {
    name: 'Books',
    image_uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    address: 'Bookstore District',
  },
  {
    name: 'Beauty',
    image_uri: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    address: 'Beauty Plaza',
  },
];

const sampleProducts = [
  {
    name: 'Premium Cotton T-Shirt',
    image_uri: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    price: 29.99,
    ar_uri: null,
    description: 'Experience ultimate comfort with our premium cotton t-shirt. Made from 100% organic cotton, this versatile piece features a relaxed fit and breathable fabric that\'s perfect for any occasion.',
    category: 'Fashion',
  },
];

const sampleUser = {
  phone: '+1234567890',
  address: '123 Main St, City, State',
};

const sampleReviews = [
  {
    rating: 5,
    comment: 'Amazing quality! The fabric is so soft and comfortable.',
  },
  {
    rating: 4,
    comment: 'Great fit and excellent value for money. Highly recommend!',
  },
  {
    rating: 5,
    comment: 'Perfect for everyday wear. Very satisfied with the purchase.',
  },
];

module.exports = { 
  categoriesPageData, 
  sampleProducts, 
  sampleUser, 
  sampleReviews 
}; 