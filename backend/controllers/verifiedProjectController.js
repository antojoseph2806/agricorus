const Project = require('../models/Project');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/projects');
    try {
      await fs.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images, videos, and documents
    const allowedExtensions = /jpeg|jpg|png|gif|webp|bmp|tiff|mp4|mov|avi|mkv|wmv|flv|webm|pdf|doc|docx|txt|rtf|odt|xls|xlsx|ppt|pptx/;
    const allowedMimeTypes = /image\/(jpeg|jpg|png|gif|webp|bmp|tiff)|video\/(mp4|quicktime|x-msvideo|x-matroska|x-ms-wmv|x-flv|webm)|application\/(pdf|msword|vnd\.openxmlformats-officedocument\.wordprocessingml\.document|vnd\.ms-excel|vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet|vnd\.ms-powerpoint|vnd\.openxmlformats-officedocument\.presentationml\.presentation|vnd\.oasis\.opendocument\.text)|text\/(plain|rtf)/;
    
    const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedMimeTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      // Provide more detailed error message
      const fileExt = path.extname(file.originalname).toLowerCase();
      const fileMime = file.mimetype;
      console.error(`File upload rejected - Extension: ${fileExt}, MIME type: ${fileMime}`);
      cb(new Error(`Invalid file type. Allowed types: Images (jpg, png, gif, webp, etc.), Videos (mp4, mov, avi, etc.), Documents (pdf, doc, docx, txt, etc.). Received: ${fileExt} (${fileMime})`));
    }
  }
});

/**
 * @desc    Create verified project with comprehensive validation
 * @route   POST /api/projects/projects/create-verified
 * @access  Private (Farmer only)
 */
exports.createVerifiedProject = [
  upload.fields([
    { name: 'aadhaarDocument', maxCount: 1 },
    { name: 'govtIdDocument', maxCount: 1 },
    { name: 'ownershipDocuments', maxCount: 10 },
    { name: 'landPhotos', maxCount: 20 },
    { name: 'landVideos', maxCount: 5 }
  ]),
  async (req, res) => {
    try {
      const farmerId = req.user._id;
      
      // Validate user role
      if (req.user.role !== 'farmer') {
        return res.status(403).json({
          success: false,
          error: 'Only farmers can create projects'
        });
      }

      const {
        // Basic Info
        title,
        description,
        cropType,
        fundingGoal,
        endDate,
        
        // Farmer Verification
        aadhaarNumber,
        govtIdType,
        govtIdNumber,
        
        // Land Ownership
        ownershipType,
        ownerName,
        relationToOwner,
        ownershipDocumentTypes,
        ownershipDocumentNumbers,
        
        // Media Descriptions
        photoDescriptions,
        videoDescriptions,
        photoGeoTags,
        videoGeoTags
      } = req.body;

      // Validate required fields
      if (!title || !description || !fundingGoal || !endDate) {
        return res.status(400).json({
          success: false,
          error: 'Basic project information is required'
        });
      }

      if (!aadhaarNumber || !govtIdType || !govtIdNumber) {
        return res.status(400).json({
          success: false,
          error: 'Identity verification information is required'
        });
      }

      // Validate Aadhaar number
      if (!/^\d{12}$/.test(aadhaarNumber)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid Aadhaar number format'
        });
      }

      // Validate files
      if (!req.files?.aadhaarDocument || !req.files?.govtIdDocument) {
        return res.status(400).json({
          success: false,
          error: 'Identity documents are required'
        });
      }

      if (!req.files?.ownershipDocuments || req.files.ownershipDocuments.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Land ownership documents are required'
        });
      }

      if (!req.files?.landPhotos || req.files.landPhotos.length < 5) {
        return res.status(400).json({
          success: false,
          error: 'Minimum 5 land photos are required'
        });
      }

      if (!req.files?.landVideos || req.files.landVideos.length < 1) {
        return res.status(400).json({
          success: false,
          error: 'Minimum 1 land video is required'
        });
      }

      // Parse land details from request body
      const landDetails = {};
      Object.keys(req.body).forEach(key => {
        if (key.startsWith('landDetails.')) {
          const fieldName = key.replace('landDetails.', '');
          landDetails[fieldName] = req.body[key];
        }
      });

      // Validate required land details
      const requiredLandFields = ['state', 'district', 'tehsil', 'village', 'panchayat', 'pincode', 'surveyNumber', 'landAreaValue', 'landAreaUnit', 'landType', 'latitude', 'longitude'];
      for (const field of requiredLandFields) {
        if (!landDetails[field]) {
          return res.status(400).json({
            success: false,
            error: `Land detail '${field}' is required`
          });
        }
      }

      // Validate coordinates
      const lat = parseFloat(landDetails.latitude);
      const lng = parseFloat(landDetails.longitude);
      if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return res.status(400).json({
          success: false,
          error: 'Invalid GPS coordinates'
        });
      }

      // Validate pincode
      if (!/^\d{6}$/.test(landDetails.pincode)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid pincode format'
        });
      }

      // Process ownership documents
      const ownershipDocuments = [];
      if (req.files.ownershipDocuments) {
        req.files.ownershipDocuments.forEach((file, index) => {
          const docType = Array.isArray(ownershipDocumentTypes) 
            ? ownershipDocumentTypes[index] 
            : ownershipDocumentTypes;
          const docNumber = Array.isArray(ownershipDocumentNumbers) 
            ? ownershipDocumentNumbers[index] 
            : ownershipDocumentNumbers;
          
          ownershipDocuments.push({
            type: docType,
            documentNumber: docNumber,
            filePath: file.path,
            uploadedAt: new Date()
          });
        });
      }

      // Process land photos
      const landPhotos = [];
      if (req.files.landPhotos) {
        req.files.landPhotos.forEach((file, index) => {
          const description = Array.isArray(photoDescriptions) 
            ? photoDescriptions[index] 
            : photoDescriptions || '';
          
          let geoTag = null;
          if (photoGeoTags) {
            try {
              const geoTagData = Array.isArray(photoGeoTags) 
                ? photoGeoTags[index] 
                : photoGeoTags;
              if (geoTagData) {
                geoTag = JSON.parse(geoTagData);
              }
            } catch (error) {
              console.warn('Failed to parse photo geo tag:', error);
            }
          }
          
          landPhotos.push({
            filePath: file.path,
            description,
            geoTag,
            uploadedAt: new Date()
          });
        });
      }

      // Process land videos
      const landVideos = [];
      if (req.files.landVideos) {
        req.files.landVideos.forEach((file, index) => {
          const description = Array.isArray(videoDescriptions) 
            ? videoDescriptions[index] 
            : videoDescriptions || '';
          
          let geoTag = null;
          if (videoGeoTags) {
            try {
              const geoTagData = Array.isArray(videoGeoTags) 
                ? videoGeoTags[index] 
                : videoGeoTags;
              if (geoTagData) {
                geoTag = JSON.parse(geoTagData);
              }
            } catch (error) {
              console.warn('Failed to parse video geo tag:', error);
            }
          }
          
          landVideos.push({
            filePath: file.path,
            description,
            geoTag,
            uploadedAt: new Date()
          });
        });
      }

      // Create project with verification data
      const project = new Project({
        farmerId,
        title: title.trim(),
        description: description.trim(),
        cropType: cropType?.trim(),
        fundingGoal: Number(fundingGoal),
        endDate: new Date(endDate),
        
        // Farmer Identity Verification
        farmerVerification: {
          aadhaarNumber,
          aadhaarDocument: req.files.aadhaarDocument[0].path,
          govtIdType,
          govtIdNumber: govtIdNumber.trim(),
          govtIdDocument: req.files.govtIdDocument[0].path,
          verificationStatus: 'PENDING'
        },

        // Land Details
        landDetails: {
          // Administrative Details
          state: landDetails.state.trim(),
          district: landDetails.district.trim(),
          tehsil: landDetails.tehsil.trim(),
          village: landDetails.village.trim(),
          panchayat: landDetails.panchayat.trim(),
          municipality: landDetails.municipality?.trim(),
          
          // Address Details
          address: {
            street: landDetails.street?.trim(),
            landmark: landDetails.landmark?.trim(),
            pincode: landDetails.pincode.trim()
          },
          
          // Land Specifications
          surveyNumber: landDetails.surveyNumber.trim(),
          subDivisionNumber: landDetails.subDivisionNumber?.trim(),
          landArea: {
            value: Number(landDetails.landAreaValue),
            unit: landDetails.landAreaUnit
          },
          landType: landDetails.landType,
          soilType: landDetails.soilType,
          irrigationSource: landDetails.irrigationSource,
          
          // GPS Coordinates
          coordinates: {
            latitude: lat,
            longitude: lng
          }
        },

        // Land Ownership
        landOwnership: {
          ownershipType,
          ownerName: ownerName.trim(),
          relationToOwner,
          documents: ownershipDocuments,
          verificationStatus: 'PENDING'
        },

        // Land Media
        landMedia: {
          photos: landPhotos,
          videos: landVideos,
          minimumPhotos: 5,
          minimumVideos: 1,
          verificationStatus: 'PENDING'
        },

        // Overall Status
        overallVerificationStatus: 'SUBMITTED',
        isApproved: false
      });

      await project.save();

      res.status(201).json({
        success: true,
        message: 'Project submitted successfully for verification',
        data: {
          projectId: project._id,
          title: project.title,
          verificationStatus: project.overallVerificationStatus
        }
      });

    } catch (error) {
      console.error('Create verified project error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create project'
      });
    }
  }
];

/**
 * @desc    Get project verification status
 * @route   GET /api/projects/projects/:id/verification-status
 * @access  Private (Farmer only)
 */
exports.getVerificationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const farmerId = req.user._id;

    const project = await Project.findOne({ _id: id, farmerId })
      .select('title overallVerificationStatus farmerVerification landOwnership landMedia adminReview');

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    res.json({
      success: true,
      data: {
        title: project.title,
        overallStatus: project.overallVerificationStatus,
        farmerVerification: {
          status: project.farmerVerification.verificationStatus,
          notes: project.farmerVerification.verificationNotes
        },
        landOwnership: {
          status: project.landOwnership.verificationStatus,
          notes: project.landOwnership.verificationNotes
        },
        landMedia: {
          status: project.landMedia.verificationStatus,
          notes: project.landMedia.verificationNotes
        },
        adminReview: project.adminReview
      }
    });

  } catch (error) {
    console.error('Get verification status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get verification status'
    });
  }
};