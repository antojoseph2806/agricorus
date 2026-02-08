import React, { useState, useRef } from 'react';
import {
  Star,
  Camera,
  X,
  Upload,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';

interface ReviewPhoto {
  file: File;
  preview: string;
  caption: string;
}

interface ReviewWithPhotosProps {
  productId: string;
  orderId: string;
  productName: string;
  onReviewSubmitted: () => void;
  existingReview?: {
    rating: number;
    comment?: string;
    photos?: Array<{ url: string; caption?: string }>;
  };
}

const ReviewWithPhotos: React.FC<ReviewWithPhotosProps> = ({
  productId,
  orderId,
  productName,
  onReviewSubmitted,
  existingReview
}) => {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [photos, setPhotos] = useState<ReviewPhoto[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxPhotos = 5;
  const maxFileSize = 5 * 1024 * 1024; // 5MB

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (photos.length + files.length > maxPhotos) {
      setError(`Maximum ${maxPhotos} photos allowed`);
      return;
    }

    const validFiles: ReviewPhoto[] = [];
    
    files.forEach(file => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed');
        return;
      }
      
      // Validate file size
      if (file.size > maxFileSize) {
        setError('File size must be less than 5MB');
        return;
      }
      
      // Create preview
      const preview = URL.createObjectURL(file);
      validFiles.push({
        file,
        preview,
        caption: ''
      });
    });

    setPhotos(prev => [...prev, ...validFiles]);
    setError(null);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => {
      const newPhotos = [...prev];
      // Revoke object URL to prevent memory leaks
      URL.revokeObjectURL(newPhotos[index].preview);
      newPhotos.splice(index, 1);
      return newPhotos;
    });
  };

  const updatePhotoCaption = (index: number, caption: string) => {
    setPhotos(prev => {
      const newPhotos = [...prev];
      newPhotos[index].caption = caption;
      return newPhotos;
    });
  };

  const submitReview = async () => {
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      // Create FormData for multipart upload
      const formData = new FormData();
      formData.append('orderId', orderId);
      formData.append('productId', productId);
      formData.append('rating', rating.toString());
      
      if (comment.trim()) {
        formData.append('comment', comment.trim());
      }

      // Add photos
      photos.forEach((photo, index) => {
        formData.append('reviewPhotos', photo.file);
      });

      // Add photo captions as JSON
      if (photos.length > 0) {
        const captions = photos.map(photo => photo.caption);
        formData.append('photoCaptions', JSON.stringify(captions));
      }

      const response = await fetch(
        `${(import.meta as any).env.VITE_BACKEND_URL || 'https://agricorus.onrender.com'}/api/reviews`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData
        }
      );

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          onReviewSubmitted();
        }, 1500);
      } else {
        throw new Error(data.message || 'Failed to submit review');
      }
    } catch (err) {
      console.error('Review submission error:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  // Clean up object URLs on unmount
  React.useEffect(() => {
    return () => {
      photos.forEach(photo => {
        URL.revokeObjectURL(photo.preview);
      });
    };
  }, []);

  if (existingReview) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="font-medium text-green-800">Review Submitted</span>
        </div>
        <div className="flex items-center gap-1 mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-4 h-4 ${
                star <= existingReview.rating
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          ))}
          <span className="text-sm text-gray-600 ml-2">
            {existingReview.rating}/5 stars
          </span>
        </div>
        {existingReview.comment && (
          <p className="text-gray-700 text-sm mb-2">"{existingReview.comment}"</p>
        )}
        {existingReview.photos && existingReview.photos.length > 0 && (
          <div className="flex gap-2 mt-2">
            {existingReview.photos.map((photo, index) => (
              <div key={index} className="relative">
                <img
                  src={`${(import.meta as any).env.VITE_BACKEND_URL || 'https://agricorus.onrender.com'}${photo.url}`}
                  alt={photo.caption || 'Review photo'}
                  className="w-16 h-16 object-cover rounded-lg border"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
        <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
        <h3 className="font-medium text-green-800 mb-1">Review Submitted!</h3>
        <p className="text-sm text-green-700">
          Thank you for sharing your experience with {productName}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-medium text-gray-900 mb-2">Rate this product</h4>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className="focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded"
            >
              <Star
                className={`w-6 h-6 transition-colors ${
                  star <= rating
                    ? 'text-yellow-400 fill-current hover:text-yellow-500'
                    : 'text-gray-300 hover:text-yellow-300'
                }`}
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="text-sm text-gray-600 ml-2">{rating}/5 stars</span>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Share your experience (optional)
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Tell others about your experience with this product..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
          rows={3}
          maxLength={1000}
        />
        <div className="text-xs text-gray-500 mt-1">
          {comment.length}/1000 characters
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Add photos (optional)
        </label>
        
        {/* Photo Upload Area */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-emerald-400 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />
          
          <div className="flex flex-col items-center gap-2">
            <Camera className="w-8 h-8 text-gray-400" />
            <div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-emerald-600 hover:text-emerald-700 font-medium text-sm"
              >
                Upload photos
              </button>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, WebP up to 5MB each. Max {maxPhotos} photos.
              </p>
            </div>
          </div>
        </div>

        {/* Photo Previews */}
        {photos.length > 0 && (
          <div className="mt-4 space-y-3">
            <h5 className="text-sm font-medium text-gray-700">
              Photos ({photos.length}/{maxPhotos})
            </h5>
            <div className="grid grid-cols-2 gap-3">
              {photos.map((photo, index) => (
                <div key={index} className="relative group">
                  <div className="relative">
                    <img
                      src={photo.preview}
                      alt={`Review photo ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border"
                    />
                    <button
                      onClick={() => removePhoto(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Add caption (optional)"
                    value={photo.caption}
                    onChange={(e) => updatePhotoCaption(index, e.target.value)}
                    className="mt-2 w-full text-xs border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                    maxLength={200}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={submitReview}
          disabled={submitting || rating === 0}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              Submit Review
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ReviewWithPhotos;