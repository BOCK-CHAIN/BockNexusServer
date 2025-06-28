# Database Seeding Scripts

This directory contains scripts for seeding your database with different types of data for different pages of your application.

## 📁 Files Overview

### Data Files
- **`categoriesSeedData.js`** - Contains data specifically for the categories page
- **`../seedData.js`** - Contains data for the home page (categories and products)

### Script Files
- **`seedAll.js`** - Master script that can seed both home and categories page data
- **`seedDatabase.js`** - Script specifically for seeding categories page data
- **`../seedScript.js`** - Script for seeding home page data

## 🚀 Usage

### Master Script (Recommended)
Use `seedAll.js` to seed different parts of your database:

```bash
# Seed both home page and categories page data
node scripts/seedAll.js

# Seed only home page data
node scripts/seedAll.js home

# Seed only categories page data
node scripts/seedAll.js categories

# Show help
node scripts/seedAll.js --help
```

### Individual Scripts
You can also run individual scripts:

```bash
# Seed home page data only
node seedScript.js

# Seed categories page data only
node scripts/seedDatabase.js
```

## 📊 Data Structure

### Home Page Data (`seedData.js`)
- **Categories**: 12 categories including Home, Gadgets, Beauty, Fashion, Mobiles, Vehicles, Appliances, Electronics, Sports, Food, Books, Toys
- **Products**: Multiple products across different categories (mostly Fashion, Books, Toys)
- **Images**: Uses Flipkart-style images

### Categories Page Data (`categoriesSeedData.js`)
- **Categories**: 6 categories with high-quality Unsplash images
  - Fashion, Electronics, Home & Garden, Sports, Books, Beauty
- **Sample Products**: Premium Cotton T-Shirt with detailed description
- **Sample User**: Test user for reviews
- **Sample Reviews**: 3 reviews for the sample product
- **Product Sizes**: XS, S, M, L, XL, XXL with stock quantities

## 🔄 Safe Operations
All scripts use `upsert` operations, which means:
- If data exists, it will be updated
- If data doesn't exist, it will be created
- Running scripts multiple times is safe and won't create duplicates

## 🎯 Use Cases

### Home Page
- Use `seedData.js` data for the main landing page
- Shows a wide variety of categories and products
- Good for showcasing the full range of your store

### Categories Page
- Use `categoriesSeedData.js` data for detailed category pages
- Focuses on quality over quantity
- Includes sample products with sizes and reviews
- Better for demonstrating product features

## 📝 Notes
- Both datasets can coexist in the same database
- Categories with the same name will be updated rather than duplicated
- Products are linked to categories by name in home page data and by ID in categories page data
- The categories page data includes more detailed product information (sizes, reviews, etc.) 