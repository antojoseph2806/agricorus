import React, { useState } from 'react';
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  User,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  X,
  Image as ImageIcon
} from 'lucide-react';

interface ReviewPhoto {
  url: string;
  caption?: string;
  uploadedAt: string;
}

interface Review {
  _id: string;
  rating: number;
  comment?: string;
  photos: ReviewPhoto[];
  helpfulVotes: number;
  unhelpfulVotes: number;
  isVerifiedPurchase: boolean;
  createdAt: string;
  buyerId: {
    _id: string;
    name: string;
  };
}

interface ReviewDisplayProps {
  reviews: Review[];
  totalReviews: number;
  averageRating: number;
  ratingDistribution: { [key: number]: number };
  onVote?: (reviewId: string, voteType: 'helpful' | 'unhelpful') => void;
  loading?: boolean;
}

interface PhotoModalProps {
  photos: ReviewPhoto[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

const PhotoModal: React.FC<PhotoModalProps> = ({
  photos,
  currentIndex,
  onClose,
  onNext,
  onPrev
}) => {
  const currentPhoto = photos[currentIndex];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
      <div className="relative max-w-4xl max-h-full p-4">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Navigation buttons */}
        {photos.length > 1 && (
          <>
            <button
              onClick={onPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={onNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Image */}
        <img
          src={`${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}${currentPhoto.url}`}
          alt={currentPhoto.caption || 'Review photo'}
          className="max-w-full max-h-full object-contain"
        />

        {/* Caption */}
        {currentPhoto.caption && (
          <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-50 text-white p-3 rounded-lg">
            <p className="text-sm">{currentPhoto.caption}</p>
          </div>
        )}

        {/* Photo counter */}
        {photos.length > 1 && (
          <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
            {currentIndex + 1} / {photos.length}
          </div>
        )}
      </div>
    </div>
  );
};

const ReviewDisplay: React.FC<ReviewDisplayProps> = ({
  reviews,
  totalReviews,
  averageRating,
  ratingDistribution,
  onVote,
  loading = false
}) => {
  const [selectedPhotoModal, setSelectedPhotoModal] = useState<{
    photos: ReviewPhoto[];
    currentIndex: number;
  } | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number, size: 'sm' | 'md' = 'sm') => {
    const starSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
    
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const openPhotoModal = (photos: ReviewPhoto[], index: number) => {
    setSelectedPhotoModal({ photos, currentIndex: index });
  };

  const closePhotoModal = () => {
    setSelectedPhotoModal(null);
  };

  const nextPhoto = () => {
    if (selectedPhotoModal) {
      const nextIndex = (selectedPhotoModal.currentIndex + 1) % selectedPhotoModal.photos.length;
      setSelectedPhotoModal({ ...selectedPhotoModal, currentIndex: nextIndex });
    }
  };

  const prevPhoto = () => {
    if (selectedPhotoModal) {
      const prevIndex = selectedPhotoModal.currentIndex === 0 
        ? selectedPhotoModal.photos.length - 1 
        : selectedPhotoModal.currentIndex - 1;
      setSelectedPhotoModal({ ...selectedPhotoModal, currentIndex: prevIndex });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg border p-4 animate-pulse">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3 mb-3"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">{averageRating.toFixed(1)}</div>
            <div className="flex items-center justify-center mb-1">
              {renderStars(Math.round(averageRating), 'md')}
            </div>
            <div className="text-sm text-gray-600">{totalReviews} reviews</div>
          </div>
          
          <div className="flex-1">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = ratingDistribution[rating] || 0;
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              
              return (
                <div key={rating} className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-gray-600 w-8">{rating}★</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-8">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="bg-white rounded-lg border p-8 text-center">
            <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
            <p className="text-gray-600">Be the first to review this product!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className="bg-white rounded-lg border p-6">
              <div className="flex items-start gap-4">
                {/* User Avatar */}
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-emerald-600" />
                </div>

                <div className="flex-1">
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-gray-900">{review.buyerId.name}</span>
                    {review.isVerifiedPurchase && (
                      <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        Verified Purchase
                      </div>
                    )}
                  </div>

                  {/* Rating and Date */}
                  <div className="flex items-center gap-3 mb-3">
                    {renderStars(review.rating)}
                    <span className="text-sm text-gray-600">
                      <Calendar className="w-3 h-3 inline mr-1" />
                      {formatDate(review.createdAt)}
                    </span>
                  </div>

                  {/* Comment */}
                  {review.comment && (
                    <p className="text-gray-700 mb-4 leading-relaxed">{review.comment}</p>
                  )}

                  {/* Photos */}
                  {review.photos && review.photos.length > 0 && (
                    <div className="mb-4">
                      <div className="flex gap-2 flex-wrap">
                        {review.photos.map((photo, index) => (
                          <button
                            key={index}
                            onClick={() => openPhotoModal(review.photos, index)}
                            className="relative group cursor-pointer"
                          >
                            <img
                              src={`${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}${photo.url}`}
                              alt={photo.caption || 'Review photo'}
                              className="w-20 h-20 object-cover rounded-lg border hover:opacity-90 transition-opacity"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all duration-200 flex items-center justify-center">
                              <ImageIcon className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Helpful Votes */}
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-600">Was this helpful?</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onVote?.(review._id, 'helpful')}
                        className="flex items-center gap-1 px-2 py-1 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                      >
                        <ThumbsUp className="w-3 h-3" />
                        <span>{review.helpfulVotes}</span>
                      </button>
                      <button
                        onClick={() => onVote?.(review._id, 'unhelpful')}
                        className="flex items-center gap-1 px-2 py-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <ThumbsDown className="w-3 h-3" />
                        <span>{review.unhelpfulVotes}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Photo Modal */}
      {selectedPhotoModal && (
        <PhotoModal
          photos={selectedPhotoModal.photos}
          currentIndex={selectedPhotoModal.currentIndex}
          onClose={closePhotoModal}
          onNext={nextPhoto}
          onPrev={prevPhoto}
        />
      )}
    </div>
  );
};

export default ReviewDisplay;