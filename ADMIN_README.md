# BockNexus Admin System

This document describes the admin functionality implemented using AdminJS and the API endpoints for React Admin integration.

## AdminJS Interface

### Access
- **URL**: `http://localhost:3000/admin`
- **Features**: 
  - Product management (CRUD operations)
  - Category management (CRUD operations)
  - Product size and stock management
  - Visual interface for managing all data

### AdminJS Features
1. **Product Management**:
   - View all products with pagination
   - Create new products
   - Edit existing products
   - Delete products
   - Manage product details (name, price, description, category, etc.)

2. **Category Management**:
   - View all categories
   - Create new categories
   - Edit existing categories
   - Delete categories (only if no products are associated)

3. **Product Size Management**:
   - View product sizes and stock levels
   - Add new sizes to products
   - Update stock quantities
   - Manage sort order

## API Endpoints for React Admin
All `/admin/*` endpoints now require:
- A valid JWT Bearer token (`Authorization: Bearer <token>`)
- An authenticated user with `role = ADMIN`

### Product Endpoints

#### Get All Products (Paginated)
- **URL**: `GET /admin/products`
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `perPage` (optional): Items per page (default: 10)
  - `sortField` (optional): Field to sort by
  - `sortOrder` (optional): Sort order (ASC/DESC)
- **Response**:
  ```json
  {
    "data": [...],
    "total": 100,
    "page": 1,
    "perPage": 10
  }
  ```

#### Get Single Product
- **URL**: `GET /admin/products/:id`
- **Response**: Product object with category and productSizes

#### Create Product
- **URL**: `POST /admin/products`
- **Body**:
  ```json
  {
    "name": "Product Name",
    "image_uri": "https://example.com/image.jpg",
    "price": 99.99,
    "description": "Product description",
    "categoryId": 1,
    "sizeType": "GENERIC",
    "color": "Red",
    "brand": "Brand Name"
  }
  ```

#### Update Product
- **URL**: `PUT /admin/products/:id`
- **Body**: Same as create (all fields optional)

#### Delete Product
- **URL**: `DELETE /admin/products/:id`
- **Response**: Success message

#### Update Product Stock
- **URL**: `PUT /admin/products/:id/stock`
- **Body**:
  ```json
  {
    "productSizes": [
      {
        "id": 1,
        "size": "M",
        "stock": 50,
        "sortOrder": 1
      }
    ]
  }
  ```

### Category Endpoints

#### Get All Categories (Paginated)
- **URL**: `GET /admin/categories`
- **Query Parameters**: Same as products
- **Response**: Same structure as products

#### Get Single Category
- **URL**: `GET /admin/categories/:id`
- **Response**: Category object with products

#### Create Category
- **URL**: `POST /admin/categories`
- **Body**:
  ```json
  {
    "name": "Category Name",
    "image_uri": "https://example.com/category.jpg"
  }
  ```

#### Update Category
- **URL**: `PUT /admin/categories/:id`
- **Body**: Same as create (all fields optional)

#### Delete Category
- **URL**: `DELETE /admin/categories/:id`
- **Response**: Success message (only if no products are associated)

## React Admin Integration

To use these endpoints with React Admin, you can configure your data provider like this:

```javascript
import { DataProvider } from 'react-admin';
import simpleRestProvider from 'ra-data-simple-rest';

const dataProvider = simpleRestProvider('http://localhost:3000/admin');

// For custom endpoints, you might need to create a custom data provider
```

## Usage Examples

### React Admin Configuration
```javascript
import { Admin, Resource } from 'react-admin';
import { ProductList, ProductEdit, ProductCreate } from './components/Products';
import { CategoryList, CategoryEdit, CategoryCreate } from './components/Categories';

const App = () => (
  <Admin dataProvider={dataProvider}>
    <Resource 
      name="products" 
      list={ProductList} 
      edit={ProductEdit} 
      create={ProductCreate} 
    />
    <Resource 
      name="categories" 
      list={CategoryList} 
      edit={CategoryEdit} 
      create={CategoryCreate} 
    />
  </Admin>
);
```

## Notes

1. **Authentication**: Admin routes are protected by JWT auth + role checks (`ADMIN` only).
2. **Image Handling**: Images are stored as URLs. You may want to implement file upload functionality.
3. **Validation**: Basic validation is implemented, but you may want to add more comprehensive validation.
4. **Error Handling**: All endpoints include proper error handling and status codes.

## File Structure

```
├── admin.js                 # AdminJS configuration
├── components/              # AdminJS custom components
│   ├── ImageShow.jsx
│   ├── ImageEdit.jsx
│   └── dashboard.jsx
├── controllers/
│   └── adminController.js   # Admin-specific controllers
├── routes/
│   └── adminRoutes.js       # Admin API routes
└── app.js                   # Main application (updated)
``` 
