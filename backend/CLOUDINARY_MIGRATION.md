# Cloudinary Migration Guide

This document explains the migration from local file storage to Cloudinary for marketplace product images and safety documents.

## What Changed

### Before (Local Storage)
- Product images stored in: `backend/uploads/products/images/`
- Safety documents stored in: `backend/uploads/products/safety-docs/`
- Files served via Express static middleware
- URLs format: `/uploads/products/images/product-image-123456.jpg`

### After (Cloudinary)
- Product images stored in Cloudinary folder: `agricorus/products/images/`
- Safety documents stored in Cloudinary folder: `agricorus/products/safety-docs/`
- Files served directly from Cloudinary CDN
- URLs format: `https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/agricorus/products/images/product-image-123456.jpg`

## Benefits of Cloudinary

1. **Performance**: CDN delivery for faster image loading worldwide
2. **Scalability**: No server storage limitations
3. **Optimization**: Automatic image optimization and transformation
4. **Reliability**: Built-in backup and redundancy
5. **Cost-effective**: No need to manage server storage

## Setup Instructions

### 1. Configure Environment Variables

Make sure your `.env` file has the following Cloudinary credentials:

```env
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

You can get these from your [Cloudinary Dashboard](https://cloudinary.com/console).

### 2. Migrate Existing Products (Optional)

If you have existing products with local images, run the migration script:

```bash
cd backend
npm run migrate:cloudinary
```

This script will:
- Find all products with local file paths
- Upload images and documents to Cloudinary
- Update product records with new Cloudinary URLs
- Keep local files intact (you can delete them manually after verification)

### 3. Verify Migration

After migration, check:
1. Product images display correctly in the marketplace
2. Safety documents are accessible
3. All product URLs start with `https://res.cloudinary.com/`

## Updated Files

### New Files
- `backend/config/cloudinary.js` - Cloudinary configuration and storage setup
- `backend/scripts/migrateProductImagesToCloudinary.js` - Migration script

### Modified Files
- `backend/middleware/uploadProduct.js` - Now uses Cloudinary storage
- `backend/controllers/productController.js` - Updated to handle Cloudinary URLs and deletions

## API Behavior

### Creating Products
When creating a product with images:
```javascript
// Request (multipart/form-data)
POST /api/vendor/products
{
  name: "Product Name",
  category: "Fertilizers",
  price: 100,
  stock: 50,
  images: [File, File], // Uploaded to Cloudinary
  safetyDocuments: [File] // For Pesticides
}

// Response
{
  success: true,
  data: {
    _id: "...",
    images: [
      "https://res.cloudinary.com/.../product-image-123.jpg",
      "https://res.cloudinary.com/.../product-image-456.jpg"
    ],
    safetyDocuments: [
      "https://res.cloudinary.com/.../safety-doc-789.pdf"
    ]
  }
}
```

### Updating Products
When updating product images:
- Old images are automatically deleted from Cloudinary
- New images are uploaded to Cloudinary
- Product record is updated with new URLs

### Deleting Products
- Soft delete (isActive = false) doesn't delete files
- Files remain in Cloudinary for potential restoration
- Manual cleanup can be done via Cloudinary dashboard if needed

## Image Transformations

Cloudinary automatically applies transformations:
- **Product Images**: Resized to max 1000x1000px (maintains aspect ratio)
- **Format**: Optimized format based on browser support (WebP, AVIF, etc.)
- **Quality**: Automatic quality optimization

## Folder Structure in Cloudinary

```
agricorus/
├── products/
│   ├── images/
│   │   ├── product-image-1234567890-123456789.jpg
│   │   ├── product-image-1234567891-987654321.jpg
│   │   └── ...
│   └── safety-docs/
│       ├── safety-doc-1234567890-123456789.pdf
│       ├── safety-doc-1234567891-987654321.pdf
│       └── ...
```

## Troubleshooting

### Images not uploading
1. Check Cloudinary credentials in `.env`
2. Verify file size limits (5MB for images, 10MB for documents)
3. Check file format (JPG, PNG, WEBP for images; PDF for documents)

### Migration script fails
1. Ensure MongoDB connection is working
2. Check if local files exist in `uploads/products/` folders
3. Verify Cloudinary credentials
4. Check console output for specific errors

### Old URLs still showing
1. Run the migration script: `npm run migrate:cloudinary`
2. Clear any frontend caches
3. Verify product records in database have Cloudinary URLs

## Rollback (If Needed)

If you need to rollback to local storage:
1. Restore the old versions of:
   - `backend/middleware/uploadProduct.js`
   - `backend/controllers/productController.js`
2. Ensure `backend/uploads/products/` folders exist
3. Restart the server

## Support

For issues or questions:
1. Check Cloudinary documentation: https://cloudinary.com/documentation
2. Review error logs in console
3. Contact the development team

## Next Steps

After successful migration:
1. Monitor Cloudinary usage in dashboard
2. Set up Cloudinary transformations if needed
3. Configure backup policies
4. Consider deleting old local files to free up server space
