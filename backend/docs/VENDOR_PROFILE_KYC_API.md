# Vendor Profile & KYC API Documentation

## Base URL
All endpoints are prefixed with: `/api/vendor/profile`

## Authentication
All endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 1. Get Vendor Profile
**GET** `/api/vendor/profile`

### Description
Retrieve the complete vendor profile and KYC status.

### Response (Success - 200)
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "vendorId": "65a1b2c3d4e5f6g7h8i9j0k2",
    "businessName": "GreenGrow Agro",
    "ownerName": "John Doe",
    "phone": "9876543210",
    "email": "vendor@example.com",
    "address": {
      "street": "123 Main Street",
      "district": "Bangalore Urban",
      "state": "Karnataka",
      "pincode": "560001"
    },
    "businessType": "PvtLtd",
    "establishedYear": 2015,
    "gstin": "29ABCDE1234F1Z5",
    "panNumber": "ABCDE1234F",
    "aadharNumber": "123456789012",
    "bankDetails": {
      "accountHolderName": "GreenGrow Agro",
      "accountNumber": "1234567890123456",
      "ifscCode": "SBIN0001234",
      "bankName": "State Bank of India"
    },
    "panCard": "/uploads/kyc/pan/panCard-1234567890-123456789.pdf",
    "aadharCard": "/uploads/kyc/aadhar/aadharCard-1234567891-123456790.jpg",
    "bankProof": "/uploads/kyc/bank/bankProof-1234567892-123456791.pdf",
    "gstCertificate": "/uploads/kyc/gst/gstCertificate-1234567893-123456792.pdf",
    "businessLicense": "/uploads/kyc/business-license/businessLicense-1234567894-123456793.pdf",
    "kycStatus": "VERIFIED",
    "rejectionReason": null,
    "submittedAt": "2024-01-15T10:30:00.000Z",
    "verifiedAt": "2024-01-16T14:20:00.000Z",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-16T14:20:00.000Z"
  }
}
```

### Response (No Profile - 200)
```json
{
  "success": true,
  "message": "Profile not found",
  "data": null
}
```

---

## 2. Get KYC Status
**GET** `/api/vendor/profile/status`

### Description
Lightweight endpoint to check KYC status without fetching full profile.

### Response (Success - 200)
```json
{
  "success": true,
  "message": "KYC status retrieved successfully",
  "data": {
    "kycStatus": "VERIFIED",
    "rejectionReason": null,
    "hasProfile": true
  }
}
```

### Response (No Profile - 200)
```json
{
  "success": true,
  "message": "Profile not found",
  "data": {
    "kycStatus": "PENDING",
    "hasProfile": false
  }
}
```

---

## 3. Create Profile & Submit KYC
**POST** `/api/vendor/profile`

### Description
Create vendor profile and submit KYC documents. Sets `kycStatus` to `SUBMITTED`.

### Request (Form Data - multipart/form-data)

#### Required Fields:
- `businessName` (String)
- `ownerName` (String)
- `phone` (String, 10 digits)
- `email` (String, valid email)
- `address.street` (String)
- `address.district` (String)
- `address.state` (String)
- `address.pincode` (String, 6 digits)
- `businessType` (String: Individual, Partnership, PvtLtd, LLP)
- `panNumber` (String, format: ABCDE1234F)
- `bankDetails.accountHolderName` (String)
- `bankDetails.accountNumber` (String, 9-18 digits)
- `bankDetails.ifscCode` (String, format: SBIN0001234)
- `bankDetails.bankName` (String)
- `panCard` (File: PDF or image)
- `bankProof` (File: PDF or image)

#### Optional Fields:
- `establishedYear` (Number)
- `gstin` (String, valid GSTIN format)
- `aadharNumber` (String, 12 digits)
- `aadharCard` (File: PDF or image)
- `gstCertificate` (File: PDF or image)
- `businessLicense` (File: PDF or image)

### Example Request (Form Data)
```javascript
{
  businessName: "GreenGrow Agro",
  ownerName: "John Doe",
  phone: "9876543210",
  email: "vendor@example.com",
  "address.street": "123 Main Street",
  "address.district": "Bangalore Urban",
  "address.state": "Karnataka",
  "address.pincode": "560001",
  businessType: "PvtLtd",
  establishedYear: "2015",
  gstin: "29ABCDE1234F1Z5",
  panNumber: "ABCDE1234F",
  aadharNumber: "123456789012",
  "bankDetails.accountHolderName": "GreenGrow Agro",
  "bankDetails.accountNumber": "1234567890123456",
  "bankDetails.ifscCode": "SBIN0001234",
  "bankDetails.bankName": "State Bank of India",
  panCard: File,
  bankProof: File,
  aadharCard: File (optional),
  gstCertificate: File (optional),
  businessLicense: File (optional)
}
```

### Response (Success - 201)
```json
{
  "success": true,
  "message": "Profile created and KYC submitted successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "vendorId": "65a1b2c3d4e5f6g7h8i9j0k2",
    "kycStatus": "SUBMITTED",
    "submittedAt": "2024-01-15T10:30:00.000Z",
    ...
  }
}
```

### Response (Error - 400)
```json
{
  "success": false,
  "message": "PAN card and Bank proof documents are required",
  "data": null
}
```

---

## 4. Update Profile
**PUT** `/api/vendor/profile`

### Description
Update vendor profile. Only allowed if `kycStatus` is NOT `VERIFIED`. If status is `PENDING` or `REJECTED`, it will be set to `SUBMITTED` on update.

### Request (Form Data - multipart/form-data)
Same structure as POST, but all fields are optional. Only include fields you want to update.

### Response (Success - 200)
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    ...
  }
}
```

### Response (Error - 403)
```json
{
  "success": false,
  "message": "Verified profile cannot be edited. Contact admin for changes.",
  "data": null
}
```

---

## Business Rules

1. **Profile Creation**: Vendor can create profile only once
2. **KYC Status Flow**: 
   - `PENDING` → `SUBMITTED` (on profile creation/update)
   - `SUBMITTED` → `VERIFIED` (admin action - future)
   - `SUBMITTED` → `REJECTED` (admin action - future)
   - `REJECTED` → `SUBMITTED` (on resubmission)
3. **Profile Editing**: 
   - `VERIFIED` profiles cannot be edited
   - `PENDING` and `REJECTED` profiles can be updated
4. **Product Activation**: Products cannot be activated unless `kycStatus = VERIFIED`
5. **Document Requirements**:
   - PAN Card: Required
   - Bank Proof: Required
   - Aadhaar Card: Optional
   - GST Certificate: Optional
   - Business License: Optional

---

## Validation Rules

### PAN Number
- Format: `ABCDE1234F` (5 letters, 4 digits, 1 letter)
- Example: `ABCDE1234F`

### IFSC Code
- Format: `SBIN0001234` (4 letters, 0, 6 alphanumeric)
- Example: `SBIN0001234`

### GSTIN
- Format: `29ABCDE1234F1Z5` (2 digits, 10 alphanumeric, 1 letter, 1 digit, 1 alphanumeric)
- Example: `29ABCDE1234F1Z5`

### Aadhaar Number
- Format: 12 digits
- Example: `123456789012`

### Phone Number
- Format: 10 digits, starting with 6-9
- Example: `9876543210`

### Pincode
- Format: 6 digits
- Example: `560001`

---

## File Upload Rules

- **Accepted Formats**: PDF, JPG, JPEG, PNG, WEBP
- **Max File Size**: 10MB per file
- **Storage Paths**:
  - PAN Card: `/uploads/kyc/pan/`
  - Aadhaar Card: `/uploads/kyc/aadhar/`
  - Bank Proof: `/uploads/kyc/bank/`
  - GST Certificate: `/uploads/kyc/gst/`
  - Business License: `/uploads/kyc/business-license/`

---

## cURL Examples

### Get Profile
```bash
curl -X GET http://localhost:5000/api/vendor/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get KYC Status
```bash
curl -X GET http://localhost:5000/api/vendor/profile/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Create Profile
```bash
curl -X POST http://localhost:5000/api/vendor/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "businessName=GreenGrow Agro" \
  -F "ownerName=John Doe" \
  -F "phone=9876543210" \
  -F "email=vendor@example.com" \
  -F "address.street=123 Main Street" \
  -F "address.district=Bangalore Urban" \
  -F "address.state=Karnataka" \
  -F "address.pincode=560001" \
  -F "businessType=PvtLtd" \
  -F "panNumber=ABCDE1234F" \
  -F "bankDetails.accountHolderName=GreenGrow Agro" \
  -F "bankDetails.accountNumber=1234567890123456" \
  -F "bankDetails.ifscCode=SBIN0001234" \
  -F "bankDetails.bankName=State Bank of India" \
  -F "panCard=@/path/to/pan.pdf" \
  -F "bankProof=@/path/to/bank.pdf"
```

---

## Error Responses

### 400 Bad Request
- Missing required fields
- Invalid format (PAN, IFSC, etc.)
- Missing required documents

### 401 Unauthorized
- Missing or invalid JWT token
- Token expired

### 403 Forbidden
- Attempting to edit verified profile
- Access denied

### 404 Not Found
- Profile not found (for update operations)

### 500 Internal Server Error
- Database errors
- File upload errors
- Server errors

