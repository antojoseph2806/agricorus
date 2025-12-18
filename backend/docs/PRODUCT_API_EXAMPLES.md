# Vendor Product Catalog API - Example Request Payloads

## Base URL
All endpoints are prefixed with: `/api/vendor/products`

## Authentication
All endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 1. Create Product
**POST** `/api/vendor/products`

### Request (Form Data - multipart/form-data)

#### Example 1: Fertilizer Product
```javascript
// Form Data
{
  name: "Organic NPK Fertilizer 20-10-10",
  category: "Fertilizers",
  price: 1250.00,
  stock: 500,
  description: "High-quality organic fertilizer with balanced NPK ratio",
  images: [File, File, File] // Max 5 images (jpg, png, webp)
}
```

#### Example 2: Pesticide Product (with safety documents)
```javascript
// Form Data
{
  name: "Neem Oil Pesticide",
  category: "Pesticides",
  price: 850.00,
  stock: 200,
  description: "Natural neem oil based pesticide for organic farming",
  images: [File, File], // Max 5 images
  safetyDocuments: [File.pdf, File.pdf] // Required for Pesticides (PDF only)
}
```

#### Example 3: Equipment Product (with warranty)
```javascript
// Form Data
{
  name: "Heavy Duty Tractor",
  category: "Equipment & Tools",
  price: 450000.00,
  stock: 5,
  description: "50 HP tractor with advanced features",
  warrantyPeriod: 24, // Months
  images: [File, File, File, File, File] // Max 5 images
}
```

### Response (Success - 201)
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "vendorId": "65a1b2c3d4e5f6g7h8i9j0k2",
    "name": "Organic NPK Fertilizer 20-10-10",
    "category": "Fertilizers",
    "price": 1250,
    "stock": 500,
    "description": "High-quality organic fertilizer with balanced NPK ratio",
    "images": [
      "/uploads/products/images/product-image-1234567890-123456789.jpg",
      "/uploads/products/images/product-image-1234567891-123456790.png"
    ],
    "safetyDocuments": [],
    "warrantyPeriod": null,
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Response (Error - 400)
```json
{
  "success": false,
  "message": "Safety documents are required for Pesticides",
  "data": null
}
```

---

## 2. Get All Vendor Products
**GET** `/api/vendor/products`

### Query Parameters (Optional)
- `isActive`: Filter by active status (`true` or `false`)

### Request
```javascript
// GET /api/vendor/products
// GET /api/vendor/products?isActive=true
// GET /api/vendor/products?isActive=false
```

### Response (Success - 200)
```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "vendorId": "65a1b2c3d4e5f6g7h8i9j0k2",
      "name": "Organic NPK Fertilizer 20-10-10",
      "category": "Fertilizers",
      "price": 1250,
      "stock": 500,
      "description": "High-quality organic fertilizer",
      "images": ["/uploads/products/images/..."],
      "safetyDocuments": [],
      "warrantyPeriod": null,
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

## 3. Get Single Product
**GET** `/api/vendor/products/:id`

### Request
```javascript
// GET /api/vendor/products/65a1b2c3d4e5f6g7h8i9j0k1
```

### Response (Success - 200)
```json
{
  "success": true,
  "message": "Product retrieved successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "vendorId": "65a1b2c3d4e5f6g7h8i9j0k2",
    "name": "Organic NPK Fertilizer 20-10-10",
    "category": "Fertilizers",
    "price": 1250,
    "stock": 500,
    "description": "High-quality organic fertilizer",
    "images": ["/uploads/products/images/..."],
    "safetyDocuments": [],
    "warrantyPeriod": null,
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Response (Error - 404)
```json
{
  "success": false,
  "message": "Product not found or access denied",
  "data": null
}
```

---

## 4. Update Product
**PUT** `/api/vendor/products/:id`

### Request (Form Data - multipart/form-data)
```javascript
// Form Data - Only include fields you want to update
{
  name: "Updated Product Name",
  price: 1500.00,
  stock: 600,
  description: "Updated description",
  images: [File, File], // Optional: New images (will replace old ones)
  safetyDocuments: [File.pdf], // Optional: New documents (will replace old ones)
  warrantyPeriod: 36 // Optional: For Equipment category
}
```

### Response (Success - 200)
```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "vendorId": "65a1b2c3d4e5f6g7h8i9j0k2",
    "name": "Updated Product Name",
    "category": "Fertilizers",
    "price": 1500,
    "stock": 600,
    "description": "Updated description",
    "images": ["/uploads/products/images/new-image-123.jpg"],
    "safetyDocuments": [],
    "warrantyPeriod": null,
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T11:45:00.000Z"
  }
}
```

---

## 5. Update Stock and Price
**PATCH** `/api/vendor/products/:id/stock`

### Request (JSON)
```json
{
  "stock": 750,
  "price": 1400.00
}
```

**Note:** At least one of `stock` or `price` must be provided.

### Response (Success - 200)
```json
{
  "success": true,
  "message": "Stock and price updated successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "vendorId": "65a1b2c3d4e5f6g7h8i9j0k2",
    "name": "Organic NPK Fertilizer 20-10-10",
    "category": "Fertilizers",
    "price": 1400,
    "stock": 750,
    "description": "High-quality organic fertilizer",
    "images": ["/uploads/products/images/..."],
    "safetyDocuments": [],
    "warrantyPeriod": null,
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T12:00:00.000Z"
  }
}
```

---

## 6. Delete Product (Soft Delete)
**DELETE** `/api/vendor/products/:id`

### Request
```javascript
// DELETE /api/vendor/products/65a1b2c3d4e5f6g7h8i9j0k1
```

### Response (Success - 200)
```json
{
  "success": true,
  "message": "Product deleted successfully",
  "data": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "isActive": false
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Missing required fields: name, category, price, stock",
  "data": null
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "No token, authorization denied",
  "data": null
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied: vendor role required",
  "data": null
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Product not found or access denied",
  "data": null
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error creating product",
  "data": null
}
```

---

## Business Rules

1. **Vendor Access**: Vendors can only access/modify their own products
2. **Safety Documents**: Required for Pesticides category
3. **Warranty Period**: Optional, only for Equipment & Tools category
4. **Images**: Maximum 5 images per product (JPG, PNG, WEBP)
5. **Safety Documents**: PDF only, required for Pesticides
6. **File Size Limits**: 
   - Images: 5MB per file
   - Documents: 10MB per file
7. **Soft Delete**: Products are soft-deleted (isActive=false), not permanently removed

---

## cURL Examples

### Create Product (Fertilizer)
```bash
curl -X POST http://localhost:5000/api/vendor/products \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "name=Organic NPK Fertilizer" \
  -F "category=Fertilizers" \
  -F "price=1250" \
  -F "stock=500" \
  -F "description=High-quality organic fertilizer" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.png"
```

### Create Product (Pesticide with Safety Documents)
```bash
curl -X POST http://localhost:5000/api/vendor/products \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "name=Neem Oil Pesticide" \
  -F "category=Pesticides" \
  -F "price=850" \
  -F "stock=200" \
  -F "description=Natural neem oil based pesticide" \
  -F "images=@/path/to/image.jpg" \
  -F "safetyDocuments=@/path/to/safety-doc.pdf"
```

### Update Stock and Price
```bash
curl -X PATCH http://localhost:5000/api/vendor/products/65a1b2c3d4e5f6g7h8i9j0k1/stock \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "stock": 750,
    "price": 1400
  }'
```

### Get All Products
```bash
curl -X GET http://localhost:5000/api/vendor/products \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Delete Product
```bash
curl -X DELETE http://localhost:5000/api/vendor/products/65a1b2c3d4e5f6g7h8i9j0k1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

