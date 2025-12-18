# Inventory & Pricing Management API - Example Request Payloads

## Base URL
All endpoints are prefixed with: `/api/vendor/products`

## Authentication
All endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 1. Update Inventory
**PATCH** `/api/vendor/products/:id/inventory`

### Description
Update product inventory including stock, price, and active status. This endpoint allows vendors to quickly manage their product inventory without updating the entire product.

### Request Body
All fields are optional. Include only the fields you want to update.

```json
{
  "stock": 120,
  "price": 950.00,
  "isActive": true
}
```

### Example 1: Update Stock Only
```json
{
  "stock": 150
}
```

### Example 2: Update Price Only
```json
{
  "price": 1250.00
}
```

### Example 3: Update Stock and Price
```json
{
  "stock": 200,
  "price": 1100.00
}
```

### Example 4: Activate Product and Update Stock
```json
{
  "stock": 50,
  "isActive": true
}
```

### Example 5: Deactivate Product
```json
{
  "isActive": false
}
```

### Response (Success - 200)
```json
{
  "success": true,
  "message": "Inventory updated successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "vendorId": "65a1b2c3d4e5f6g7h8i9j0k2",
    "name": "Organic NPK Fertilizer 20-10-10",
    "category": "Fertilizers",
    "price": 950,
    "stock": 120,
    "description": "High-quality organic fertilizer",
    "images": ["/uploads/products/images/..."],
    "safetyDocuments": [],
    "warrantyPeriod": null,
    "isActive": true,
    "stockStatus": "IN_STOCK",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T12:45:00.000Z"
  }
}
```

### Response (Error - 400)
```json
{
  "success": false,
  "message": "Stock cannot be negative",
  "data": null
}
```

### Response (Error - 400 - Inactive Product)
```json
{
  "success": false,
  "message": "Cannot update inventory for inactive products. Please activate the product first.",
  "data": null
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

## Business Rules

1. **Vendor Ownership**: Vendors can only update their own products
2. **Stock Validation**: Stock cannot be negative
3. **Price Validation**: Price must be greater than 0
4. **Inactive Products**: Cannot update stock/price for inactive products unless re-enabling
5. **Stock Status**: Automatically calculated based on stock:
   - `OUT_OF_STOCK`: stock = 0
   - `LOW_STOCK`: stock < 10
   - `IN_STOCK`: stock >= 10

---

## Stock Status Virtual Field

The `stockStatus` field is a virtual field that is automatically calculated:

- **OUT_OF_STOCK**: When `stock === 0`
- **LOW_STOCK**: When `stock > 0 && stock < 10`
- **IN_STOCK**: When `stock >= 10`

This field is included in all product responses and can be used for filtering and display purposes.

---

## cURL Examples

### Update Stock and Price
```bash
curl -X PATCH http://localhost:5000/api/vendor/products/65a1b2c3d4e5f6g7h8i9j0k1/inventory \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "stock": 120,
    "price": 950.00
  }'
```

### Activate Product
```bash
curl -X PATCH http://localhost:5000/api/vendor/products/65a1b2c3d4e5f6g7h8i9j0k1/inventory \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "isActive": true
  }'
```

### Update Only Stock
```bash
curl -X PATCH http://localhost:5000/api/vendor/products/65a1b2c3d4e5f6g7h8i9j0k1/inventory \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "stock": 200
  }'
```

---

## Frontend Integration

### React/TypeScript Example

```typescript
const updateInventory = async (productId: string, data: {
  stock?: number;
  price?: number;
  isActive?: boolean;
}) => {
  const token = localStorage.getItem("token");
  
  const response = await axios.patch(
    `http://localhost:5000/api/vendor/products/${productId}/inventory`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (response.data.success) {
    console.log("Inventory updated:", response.data.data);
    return response.data.data;
  }
};
```

### Usage Example

```typescript
// Update stock and price
await updateInventory("65a1b2c3d4e5f6g7h8i9j0k1", {
  stock: 150,
  price: 1100.00,
});

// Activate product
await updateInventory("65a1b2c3d4e5f6g7h8i9j0k1", {
  isActive: true,
});

// Update only stock
await updateInventory("65a1b2c3d4e5f6g7h8i9j0k1", {
  stock: 200,
});
```

---

## Error Handling

### Common Errors

1. **400 Bad Request**
   - Stock is negative
   - Price is 0 or negative
   - Attempting to update inactive product inventory

2. **401 Unauthorized**
   - Missing or invalid JWT token
   - Token expired

3. **403 Forbidden**
   - Vendor trying to update another vendor's product

4. **404 Not Found**
   - Product ID doesn't exist
   - Product doesn't belong to the vendor

5. **500 Internal Server Error**
   - Database connection issues
   - Server errors

---

## Notes

- The endpoint uses PATCH method for partial updates
- All fields in the request body are optional
- Only provided fields will be updated
- The `stockStatus` field is automatically recalculated after update
- The `updatedAt` timestamp is automatically updated by Mongoose

