// Product form validation utilities

export interface ProductFormData {
  name: string;
  category: string;
  price: string;
  stock: string;
  description: string;
  warrantyPeriod: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Validation rules
const VALIDATION_RULES = {
  name: {
    required: true,
    minLength: 3,
    maxLength: 200,
    pattern: /^[a-zA-Z0-9\s\-\.\(\)\&]+$/,
    patternMessage: "Product name can only contain letters, numbers, spaces, hyphens, dots, parentheses, and ampersands"
  },
  price: {
    required: true,
    min: 0.01,
    max: 1000000,
    decimalPlaces: 2
  },
  stock: {
    required: true,
    min: 0,
    max: 999999,
    integer: true
  },
  description: {
    maxLength: 2000,
    pattern: /^[a-zA-Z0-9\s\-\.\,\!\?\(\)\&\n\r]*$/,
    patternMessage: "Description contains invalid characters"
  },
  warrantyPeriod: {
    min: 0,
    max: 120,
    integer: true
  }
};

// File validation rules
export const FILE_VALIDATION = {
  images: {
    maxCount: 5,
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp']
  },
  safetyDocuments: {
    maxCount: 10,
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['application/pdf'],
    allowedExtensions: ['.pdf']
  }
};

export const validateProductForm = (formData: ProductFormData): ValidationResult => {
  const errors: ValidationError[] = [];

  // Validate product name
  if (!formData.name.trim()) {
    errors.push({ field: 'name', message: 'Product name is required' });
  } else {
    const name = formData.name.trim();
    if (name.length < VALIDATION_RULES.name.minLength) {
      errors.push({ field: 'name', message: `Product name must be at least ${VALIDATION_RULES.name.minLength} characters long` });
    }
    if (name.length > VALIDATION_RULES.name.maxLength) {
      errors.push({ field: 'name', message: `Product name cannot exceed ${VALIDATION_RULES.name.maxLength} characters` });
    }
    if (!VALIDATION_RULES.name.pattern.test(name)) {
      errors.push({ field: 'name', message: VALIDATION_RULES.name.patternMessage });
    }
  }

  // Validate category
  const validCategories = ['Fertilizers', 'Pesticides', 'Equipment & Tools'];
  if (!formData.category || !validCategories.includes(formData.category)) {
    errors.push({ field: 'category', message: 'Please select a valid category' });
  }

  // Validate price
  if (!formData.price.trim()) {
    errors.push({ field: 'price', message: 'Price is required' });
  } else {
    const price = parseFloat(formData.price);
    if (isNaN(price)) {
      errors.push({ field: 'price', message: 'Price must be a valid number' });
    } else {
      if (price < VALIDATION_RULES.price.min) {
        errors.push({ field: 'price', message: `Price must be at least ₹${VALIDATION_RULES.price.min}` });
      }
      if (price > VALIDATION_RULES.price.max) {
        errors.push({ field: 'price', message: `Price cannot exceed ₹${VALIDATION_RULES.price.max.toLocaleString()}` });
      }
      // Check decimal places
      const decimalPlaces = (formData.price.split('.')[1] || '').length;
      if (decimalPlaces > VALIDATION_RULES.price.decimalPlaces) {
        errors.push({ field: 'price', message: `Price can have maximum ${VALIDATION_RULES.price.decimalPlaces} decimal places` });
      }
    }
  }

  // Validate stock
  if (!formData.stock.trim()) {
    errors.push({ field: 'stock', message: 'Stock quantity is required' });
  } else {
    const stock = parseInt(formData.stock);
    if (isNaN(stock)) {
      errors.push({ field: 'stock', message: 'Stock must be a valid number' });
    } else {
      if (stock < VALIDATION_RULES.stock.min) {
        errors.push({ field: 'stock', message: `Stock cannot be negative` });
      }
      if (stock > VALIDATION_RULES.stock.max) {
        errors.push({ field: 'stock', message: `Stock cannot exceed ${VALIDATION_RULES.stock.max.toLocaleString()} units` });
      }
      if (!Number.isInteger(stock)) {
        errors.push({ field: 'stock', message: 'Stock must be a whole number' });
      }
    }
  }

  // Validate description (optional)
  if (formData.description.trim()) {
    const description = formData.description.trim();
    if (description.length > VALIDATION_RULES.description.maxLength) {
      errors.push({ field: 'description', message: `Description cannot exceed ${VALIDATION_RULES.description.maxLength} characters` });
    }
    if (!VALIDATION_RULES.description.pattern.test(description)) {
      errors.push({ field: 'description', message: VALIDATION_RULES.description.patternMessage });
    }
  }

  // Validate warranty period (for Equipment & Tools)
  if (formData.category === 'Equipment & Tools' && formData.warrantyPeriod.trim()) {
    const warrantyPeriod = parseInt(formData.warrantyPeriod);
    if (isNaN(warrantyPeriod)) {
      errors.push({ field: 'warrantyPeriod', message: 'Warranty period must be a valid number' });
    } else {
      if (warrantyPeriod < VALIDATION_RULES.warrantyPeriod.min) {
        errors.push({ field: 'warrantyPeriod', message: 'Warranty period cannot be negative' });
      }
      if (warrantyPeriod > VALIDATION_RULES.warrantyPeriod.max) {
        errors.push({ field: 'warrantyPeriod', message: `Warranty period cannot exceed ${VALIDATION_RULES.warrantyPeriod.max} months` });
      }
      if (!Number.isInteger(warrantyPeriod)) {
        errors.push({ field: 'warrantyPeriod', message: 'Warranty period must be a whole number' });
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateFiles = (files: File[], type: 'images' | 'safetyDocuments'): ValidationError[] => {
  const errors: ValidationError[] = [];
  const rules = FILE_VALIDATION[type];

  // Check file count
  if (files.length > rules.maxCount) {
    errors.push({ 
      field: type, 
      message: `Maximum ${rules.maxCount} ${type === 'images' ? 'images' : 'documents'} allowed` 
    });
  }

  // Validate each file
  files.forEach((file, index) => {
    // Check file size
    if (file.size > rules.maxSize) {
      const maxSizeMB = rules.maxSize / (1024 * 1024);
      errors.push({ 
        field: type, 
        message: `${file.name}: File size cannot exceed ${maxSizeMB}MB` 
      });
    }

    // Check file type
    if (!rules.allowedTypes.includes(file.type)) {
      errors.push({ 
        field: type, 
        message: `${file.name}: Invalid file type. Allowed types: ${rules.allowedExtensions.join(', ')}` 
      });
    }

    // Check file extension
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!rules.allowedExtensions.includes(fileExtension)) {
      errors.push({ 
        field: type, 
        message: `${file.name}: Invalid file extension. Allowed extensions: ${rules.allowedExtensions.join(', ')}` 
      });
    }

    // Additional validation for images
    if (type === 'images') {
      // Check if file name is reasonable
      if (file.name.length > 100) {
        errors.push({ 
          field: type, 
          message: `${file.name}: File name is too long (max 100 characters)` 
        });
      }
    }

    // Additional validation for PDFs
    if (type === 'safetyDocuments') {
      // Check if file name is reasonable
      if (file.name.length > 100) {
        errors.push({ 
          field: type, 
          message: `${file.name}: File name is too long (max 100 characters)` 
        });
      }
    }
  });

  return errors;
};

export const validateSpecialRequirements = (
  formData: ProductFormData, 
  images: File[], 
  existingImages: string[] = [],
  safetyDocs: File[] = [],
  existingSafetyDocs: string[] = []
): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Safety documents required for Pesticides
  if (formData.category === 'Pesticides') {
    const totalSafetyDocs = safetyDocs.length + existingSafetyDocs.length;
    if (totalSafetyDocs === 0) {
      errors.push({ 
        field: 'safetyDocuments', 
        message: 'Safety documents are required for Pesticides category' 
      });
    }
  }

  // At least one image recommended
  const totalImages = images.length + existingImages.length;
  if (totalImages === 0) {
    errors.push({ 
      field: 'images', 
      message: 'At least one product image is recommended' 
    });
  }

  // Total images limit
  if (totalImages > FILE_VALIDATION.images.maxCount) {
    errors.push({ 
      field: 'images', 
      message: `Total images (existing + new) cannot exceed ${FILE_VALIDATION.images.maxCount}` 
    });
  }

  return errors;
};

// Real-time validation for individual fields
export const validateField = (field: string, value: string, formData?: ProductFormData): string | null => {
  switch (field) {
    case 'name':
      if (!value.trim()) return 'Product name is required';
      if (value.trim().length < VALIDATION_RULES.name.minLength) {
        return `Must be at least ${VALIDATION_RULES.name.minLength} characters long`;
      }
      if (value.trim().length > VALIDATION_RULES.name.maxLength) {
        return `Cannot exceed ${VALIDATION_RULES.name.maxLength} characters`;
      }
      if (!VALIDATION_RULES.name.pattern.test(value.trim())) {
        return VALIDATION_RULES.name.patternMessage;
      }
      break;

    case 'price':
      if (!value.trim()) return 'Price is required';
      const price = parseFloat(value);
      if (isNaN(price)) return 'Must be a valid number';
      if (price < VALIDATION_RULES.price.min) return `Must be at least ₹${VALIDATION_RULES.price.min}`;
      if (price > VALIDATION_RULES.price.max) return `Cannot exceed ₹${VALIDATION_RULES.price.max.toLocaleString()}`;
      const decimalPlaces = (value.split('.')[1] || '').length;
      if (decimalPlaces > VALIDATION_RULES.price.decimalPlaces) {
        return `Maximum ${VALIDATION_RULES.price.decimalPlaces} decimal places allowed`;
      }
      break;

    case 'stock':
      if (!value.trim()) return 'Stock is required';
      const stock = parseInt(value);
      if (isNaN(stock)) return 'Must be a valid number';
      if (stock < VALIDATION_RULES.stock.min) return 'Cannot be negative';
      if (stock > VALIDATION_RULES.stock.max) return `Cannot exceed ${VALIDATION_RULES.stock.max.toLocaleString()}`;
      if (!Number.isInteger(stock)) return 'Must be a whole number';
      break;

    case 'description':
      if (value.trim() && value.trim().length > VALIDATION_RULES.description.maxLength) {
        return `Cannot exceed ${VALIDATION_RULES.description.maxLength} characters`;
      }
      if (value.trim() && !VALIDATION_RULES.description.pattern.test(value.trim())) {
        return VALIDATION_RULES.description.patternMessage;
      }
      break;

    case 'warrantyPeriod':
      if (formData?.category === 'Equipment & Tools' && value.trim()) {
        const warranty = parseInt(value);
        if (isNaN(warranty)) return 'Must be a valid number';
        if (warranty < VALIDATION_RULES.warrantyPeriod.min) return 'Cannot be negative';
        if (warranty > VALIDATION_RULES.warrantyPeriod.max) return `Cannot exceed ${VALIDATION_RULES.warrantyPeriod.max} months`;
        if (!Number.isInteger(warranty)) return 'Must be a whole number';
      }
      break;
  }

  return null;
};