# Marketplace & Purchase Flow API Documentation

## Base URLs
- Marketplace Products: `/api/marketplace/products`
- Cart: `/api/cart`
- Orders: `/api/orders`

## Authentication
Cart and Order endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 1. Get Marketplace Products (PUBLIC)
**GET** `/api/marketplace/products`

### Description
Get all active products from verified vendors. This is a public endpoint (no authentication required).

### Query Parameters
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 12)
- `category` (optional): Filter by category (Fertilizers, Pesticides, Equipment & Tools)
- `search` (optional): Search by product name
- `minPrice` (optional): Minimum price filter
- `maxPrice` (optional): Maximum price filter
- `sortBy` (optional): Sort field (createdAt, price, name) - default: createdAt
- `sortOrder` (optional): Sort order (asc, desc) - default: desc

### Example Request
```
GET /api/marketplace/products?page=1&limit=12&category=Fertilizers&minPrice=100&maxPrice=5000&sortBy=price&sortOrder=asc
```

### Response (Success - 200)
```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": {
    "products": [
      {
        "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
        "name": "Organic NPK Fertilizer 20-10-10",
        "category": "Fertilizers",
        "price": 1250,
        "stock": 500,
        "description": "High-quality organic fertilizer",
        "images": ["/uploads/products/images/..."],
        "vendorBusinessName": "GreenGrow Agro",
        "stockStatus": "IN_STOCK",
        "warrantyPeriod": null,
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalProducts": 58,
      "limit": 12
    },
    "filters": {
      "category": "Fertilizers",
      "search": "",
      "minPrice": "100",
      "maxPrice": "5000",
      "sortBy": "price",
      "sortOrder": "asc"
    }
  }
}
```

---

## 2. Get Product Details (PUBLIC)
**GET** `/api/marketplace/products/:id`

### Description
Get detailed information about a single product.

### Response (Success - 200)
```json
{
  "success": true,
  "message": "Product details retrieved successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "name": "Organic NPK Fertilizer 20-10-10",
    "category": "Fertilizers",
    "price": 1250,
    "stock": 500,
    "description": "High-quality organic fertilizer with balanced NPK ratio",
    "images": ["/uploads/products/images/..."],
    "vendorBusinessName": "GreenGrow Agro",
    "vendorId": "65a1b2c3d4e5f6g7h8i9j0k2",
    "stockStatus": "IN_STOCK",
    "warrantyPeriod": null,
    "safetyDocuments": [],
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Response (Error - 404)
```json
{
  "success": false,
  "message": "Product not available",
  "data": null
}
```

---

## 3. Get Cart
**GET** `/api/cart`

### Description
Get user's shopping cart. Only accessible to farmers and landowners.

### Response (Success - 200)
```json
{
  "success": true,
  "message": "Cart retrieved successfully",
  "data": {
    "items": [
      {
        "productId": "65a1b2c3d4e5f6g7h8i9j0k1",
        "productName": "Organic NPK Fertilizer",
        "category": "Fertilizers",
        "price": 1250,
        "priceAtAddTime": 1250,
        "quantity": 2,
        "stock": 500,
        "image": "/uploads/products/images/...",
        "vendorId": "65a1b2c3d4e5f6g7h8i9j0k2",
        "vendorBusinessName": "GreenGrow Agro",
        "subtotal": 2500,
        "isAvailable": true,
        "maxQuantity": 500
      }
    ],
    "subtotal": 2500,
    "totalItems": 2,
    "itemCount": 1
  }
}
```

---

## 4. Add to Cart
**POST** `/api/cart/add`

### Description
Add a product to the shopping cart.

### Request Body
```json
{
  "productId": "65a1b2c3d4e5f6g7h8i9j0k1",
  "quantity": 2
}
```

### Response (Success - 200)
```json
{
  "success": true,
  "message": "Item added to cart successfully",
  "data": {
    "cartItem": {
      "productId": "65a1b2c3d4e5f6g7h8i9j0k1",
      "quantity": 2,
      "priceAtAddTime": 1250
    },
    "totalItems": 1
  }
}
```

### Response (Error - 400)
```json
{
  "success": false,
  "message": "Only 10 units available in stock",
  "data": null
}
```

---

## 5. Update Cart Item
**PATCH** `/api/cart/update`

### Description
Update the quantity of an item in the cart. Set quantity to 0 to remove.

### Request Body
```json
{
  "productId": "65a1b2c3d4e5f6g7h8i9j0k1",
  "quantity": 5
}
```

### Response (Success - 200)
```json
{
  "success": true,
  "message": "Cart item updated successfully",
  "data": {
    "cartItem": {
      "productId": "65a1b2c3d4e5f6g7h8i9j0k1",
      "quantity": 5,
      "priceAtAddTime": 1250
    },
    "totalItems": 1
  }
}
```

---

## 6. Remove from Cart
**DELETE** `/api/cart/remove/:productId`

### Description
Remove an item from the cart.

### Response (Success - 200)
```json
{
  "success": true,
  "message": "Item removed from cart successfully",
  "data": {
    "totalItems": 0
  }
}
```

---

## 7. Checkout (Create Order)
**POST** `/api/orders/checkout`

### Description
Create an order from the cart. This will:
- Lock stock (deduct from inventory)
- Create order with PLACED status
- Clear the cart
- Use current product prices (prevents price tampering)

### Request Body
```json
{
  "deliveryAddress": {
    "street": "123 Main Street",
    "district": "Bangalore Urban",
    "state": "Karnataka",
    "pincode": "560001"
  },
  "notes": "Please deliver in the morning"
}
```

### Response (Success - 201)
```json
{
  "success": true,
  "message": "Order placed successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k3",
    "orderNumber": "ORD-1705312345678-1234",
    "buyerId": "65a1b2c3d4e5f6g7h8i9j0k4",
    "buyerRole": "farmer",
    "items": [
      {
        "productId": {
          "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
          "name": "Organic NPK Fertilizer",
          "category": "Fertilizers",
          "images": ["/uploads/products/images/..."]
        },
        "vendorId": {
          "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
          "businessName": "GreenGrow Agro"
        },
        "productName": "Organic NPK Fertilizer",
        "quantity": 2,
        "price": 1250,
        "subtotal": 2500
      }
    ],
    "totalAmount": 2500,
    "paymentStatus": "PENDING",
    "orderStatus": "PLACED",
    "deliveryAddress": {
      "street": "123 Main Street",
      "district": "Bangalore Urban",
      "state": "Karnataka",
      "pincode": "560001"
    },
    "notes": "Please deliver in the morning",
    "createdAt": "2024-01-15T12:00:00.000Z"
  }
}
```

### Response (Error - 400)
```json
{
  "success": false,
  "message": "Only 10 units available for \"Organic NPK Fertilizer\"",
  "data": null
}
```

---

## 8. Get User Orders
**GET** `/api/orders`

### Description
Get all orders for the logged-in user.

### Response (Success - 200)
```json
{
  "success": true,
  "message": "Orders retrieved successfully",
  "data": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k3",
      "orderNumber": "ORD-1705312345678-1234",
      "items": [
        {
          "productId": {
            "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
            "name": "Organic NPK Fertilizer",
            "category": "Fertilizers",
            "images": ["/uploads/products/images/..."]
          },
          "vendorId": {
            "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
            "businessName": "GreenGrow Agro"
          },
          "productName": "Organic NPK Fertilizer",
          "quantity": 2,
          "price": 1250,
          "subtotal": 2500
        }
      ],
      "totalAmount": 2500,
      "paymentStatus": "PENDING",
      "orderStatus": "PLACED",
      "createdAt": "2024-01-15T12:00:00.000Z"
    }
  ]
}
```

---

## 9. Get Order Details
**GET** `/api/orders/:id`

### Description
Get detailed information about a specific order.

### Response (Success - 200)
```json
{
  "success": true,
  "message": "Order details retrieved successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k3",
    "orderNumber": "ORD-1705312345678-1234",
    "buyerId": {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k4",
      "name": "John Farmer",
      "email": "farmer@example.com"
    },
    "items": [
      {
        "productId": {
          "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
          "name": "Organic NPK Fertilizer",
          "category": "Fertilizers",
          "images": ["/uploads/products/images/..."],
          "description": "High-quality organic fertilizer",
          "warrantyPeriod": null
        },
        "vendorId": {
          "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
          "businessName": "GreenGrow Agro"
        },
        "productName": "Organic NPK Fertilizer",
        "quantity": 2,
        "price": 1250,
        "subtotal": 2500
      }
    ],
    "totalAmount": 2500,
    "paymentStatus": "PENDING",
    "orderStatus": "PLACED",
    "deliveryAddress": {
      "street": "123 Main Street",
      "district": "Bangalore Urban",
      "state": "Karnataka",
      "pincode": "560001"
    },
    "notes": "Please deliver in the morning",
    "createdAt": "2024-01-15T12:00:00.000Z",
    "updatedAt": "2024-01-15T12:00:00.000Z"
  }
}
```

---

## Business Rules

1. **Product Visibility**:
   - Only products from KYC-VERIFIED vendors are shown
   - Only ACTIVE products with stock > 0 are shown
   - Safety documents are only shown for Pesticides

2. **Cart Rules**:
   - Only farmers and landowners can access cart
   - Quantity cannot exceed available stock
   - Stock is validated on every cart operation
   - Price is locked at add time but validated on checkout

3. **Order Creation**:
   - Stock is locked (deducted) during checkout
   - Uses current product prices (prevents price tampering)
   - Cart is cleared after successful order
   - Order status starts as PLACED
   - Payment status starts as PENDING

4. **Security**:
   - Vendors cannot purchase products
   - ObjectId validation on all endpoints
   - Price validation prevents tampering
   - Stock validation prevents overselling

---

## Error Responses

### 400 Bad Request
- Invalid product ID
- Quantity exceeds stock
- Missing required fields
- Invalid address format

### 401 Unauthorized
- Missing or invalid JWT token
- Token expired

### 403 Forbidden
- Vendor trying to access cart/orders
- Invalid role

### 404 Not Found
- Product not found
- Order not found
- Cart not found

### 500 Internal Server Error
- Database errors
- Server errors

---

## cURL Examples

### Get Marketplace Products
```bash
curl -X GET "http://localhost:5000/api/marketplace/products?category=Fertilizers&page=1&limit=12"
```

### Add to Cart
```bash
curl -X POST http://localhost:5000/api/cart/add \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "quantity": 2
  }'
```

### Checkout
```bash
curl -X POST http://localhost:5000/api/orders/checkout \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "deliveryAddress": {
      "street": "123 Main Street",
      "district": "Bangalore Urban",
      "state": "Karnataka",
      "pincode": "560001"
    },
    "notes": "Morning delivery preferred"
  }'
```

