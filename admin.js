const AdminJS = require('adminjs');
const AdminJSExpress = require('@adminjs/express');
const AdminJSPrisma = require('@adminjs/prisma');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Register the Prisma adapter
AdminJS.registerAdapter({
  Resource: AdminJSPrisma.Resource,
  Database: AdminJSPrisma.Database,
});

const adminJs = new AdminJS({
  resources: [
    {
      resource: { model: prisma.product, client: prisma },
      options: {
        navigation: { name: 'Products', icon: 'Product' },
        properties: {
          id: { isVisible: { list: true, filter: true, show: true, edit: false } },
          name: { isTitle: true },
          image_uri: { 
            isVisible: { list: true, filter: false, show: true, edit: true }
          },
          price: { 
            isVisible: { list: true, filter: true, show: true, edit: true },
            type: 'number'
          },
          description: { 
            isVisible: { list: false, filter: false, show: true, edit: true },
            type: 'textarea'
          },
          categoryId: { 
            isVisible: { list: true, filter: true, show: true, edit: true },
            reference: 'Category'
          },
          sizeType: { 
            isVisible: { list: true, filter: true, show: true, edit: true },
            availableValues: [
              { value: 'NONE', label: 'None' },
              { value: 'GENERIC', label: 'Generic' },
              { value: 'SHOES_UK_MEN', label: 'Shoes UK Men' },
              { value: 'SHOES_UK_WOMEN', label: 'Shoes UK Women' },
              { value: 'NUMERIC', label: 'Numeric' },
              { value: 'VOLUME_ML', label: 'Volume ML' },
              { value: 'WEIGHT_G', label: 'Weight G' },
              { value: 'ONE_SIZE', label: 'One Size' },
              { value: 'WAIST_INCH', label: 'Waist Inch' }
            ]
          },
          color: { isVisible: { list: true, filter: true, show: true, edit: true } },
          brand: { isVisible: { list: true, filter: true, show: true, edit: true } },
          createdAt: { 
            isVisible: { list: true, filter: true, show: true, edit: false },
            type: 'datetime'
          },
          updatedAt: { 
            isVisible: { list: false, filter: false, show: true, edit: false },
            type: 'datetime'
          }
        },
        actions: {
          new: {
            before: async (request) => {
              if (request.payload.price) {
                request.payload.price = parseFloat(request.payload.price);
              }
              if (request.payload.categoryId) {
                request.payload.categoryId = parseInt(request.payload.categoryId);
              }
              return request;
            }
          },
          edit: {
            before: async (request) => {
              if (request.payload.price) {
                request.payload.price = parseFloat(request.payload.price);
              }
              if (request.payload.categoryId) {
                request.payload.categoryId = parseInt(request.payload.categoryId);
              }
              return request;
            }
          }
        }
      }
    },
    {
      resource: { model: prisma.category, client: prisma },
      options: {
        navigation: { name: 'Categories', icon: 'Category' },
        properties: {
          id: { isVisible: { list: true, filter: true, show: true, edit: false } },
          name: { isTitle: true },
          image_uri: { 
            isVisible: { list: true, filter: false, show: true, edit: true }
          },
          createdAt: { 
            isVisible: { list: true, filter: true, show: true, edit: false },
            type: 'datetime'
          },
          updatedAt: { 
            isVisible: { list: false, filter: false, show: true, edit: false },
            type: 'datetime'
          }
        }
      }
    },
    {
      resource: { model: prisma.productSize, client: prisma },
      options: {
        navigation: { name: 'Product Sizes', icon: 'Size' },
        properties: {
          id: { isVisible: { list: true, filter: true, show: true, edit: false } },
          productId: { 
            isVisible: { list: true, filter: true, show: true, edit: true },
            reference: 'Product'
          },
          size: { isVisible: { list: true, filter: true, show: true, edit: true } },
          stock: { 
            isVisible: { list: true, filter: true, show: true, edit: true },
            type: 'number'
          },
          sortOrder: { 
            isVisible: { list: true, filter: true, show: true, edit: true },
            type: 'number'
          },
          createdAt: { 
            isVisible: { list: false, filter: false, show: true, edit: false },
            type: 'datetime'
          },
          updatedAt: { 
            isVisible: { list: false, filter: false, show: true, edit: false },
            type: 'datetime'
          }
        },
        actions: {
          new: {
            before: async (request) => {
              if (request.payload.productId) {
                request.payload.productId = parseInt(request.payload.productId);
              }
              if (request.payload.stock) {
                request.payload.stock = parseInt(request.payload.stock);
              }
              if (request.payload.sortOrder) {
                request.payload.sortOrder = parseInt(request.payload.sortOrder);
              }
              return request;
            }
          },
          edit: {
            before: async (request) => {
              if (request.payload.productId) {
                request.payload.productId = parseInt(request.payload.productId);
              }
              if (request.payload.stock) {
                request.payload.stock = parseInt(request.payload.stock);
              }
              if (request.payload.sortOrder) {
                request.payload.sortOrder = parseInt(request.payload.sortOrder);
              }
              return request;
            }
          }
        }
      }
    }
  ],
  rootPath: '/admin',
  branding: {
    companyName: 'BockNexus Admin',
    logo: false,
    softwareBrothers: false
  }
});

const router = AdminJSExpress.buildRouter(adminJs);

module.exports = { adminJs, router }; 