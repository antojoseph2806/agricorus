import { useEffect, useState } from "react";
import axios from "axios";
import VendorLayout from "./VendorLayout";
import { 
  Star, 
  User, 
  Package, 
  Search, 
  Filter, 
  Calendar,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Image as ImageIcon,
  Eye,
  TrendingUp,
  BarChart3,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";

interface Review {
  _id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  productId: {
    _id: string;
    name: string;
    images?: string[];
  };
  buyerId: {
    _id: string;
    name: string;
    email?: string;
  };
  photos?: Array<{
    url: string;
    caption?: string;
    uploadedAt: string;
  }>;
  helpfulVotes?: number;
  unhelpfulVotes?: number;
  isVerifiedPurchase?: boolean;
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: { [key: number]: number };
}

const VendorFeedback = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState<number | "all">("all");
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState<ReviewStats>({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  });

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${(import.meta as any).env.VITE_BACKEND_URL || "https://agricorus.onrender.com"}/api/vendor/reviews`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      if (response.data.success) {
        const reviewData = response.data.data?.reviews || response.data.data || [];
        setReviews(reviewData);
        calculateStats(reviewData);
      } else {
        setError(response.data.message || "Failed to load reviews");
      }
    } catch (err: any) {
      console.error("Fetch reviews error:", err);
      setError(err.response?.data?.message || "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (reviewData: Review[]) => {
    if (reviewData.length === 0) {
      setStats({
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      });
      return;
    }

    const totalRating = reviewData.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviewData.length;
    
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviewData.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++;
    });

    setStats({
      averageRating: Number(averageRating.toFixed(1)),
      totalReviews: reviewData.length,
      ratingDistribution: distribution
    });
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const renderStars = (rating: number, size: "sm" | "md" | "lg" = "sm") => {
    const sizeClasses = {
      sm: "w-4 h-4",
      md: "w-5 h-5", 
      lg: "w-6 h-6"
    };

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`${sizeClasses[size]} ${i <= rating ? "text-yellow-500 fill-yellow-400" : "text-gray-300"}`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.productId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.buyerId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.comment?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRating = ratingFilter === "all" || review.rating === ratingFilter;
    
    return matchesSearch && matchesRating;
  });

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "text-green-600 bg-green-50";
    if (rating >= 3) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  return (
    <VendorLayout>
      <div className="p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 sm:gap-6">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-2">Ratings & Reviews</h1>
              <p className="text-sm sm:text-base text-gray-600">Monitor customer feedback and improve your products.</p>
            </div>
            <button
              onClick={fetchReviews}
              disabled={loading}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-300 disabled:opacity-50 text-sm sm:text-base"
            >
              <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-3 sm:p-4 lg:p-6">
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div className="min-w-0">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{stats.averageRating}</div>
                <div className="text-xs sm:text-sm text-gray-600 truncate">Average Rating</div>
                {renderStars(Math.round(stats.averageRating), "sm")}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-3 sm:p-4 lg:p-6">
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <div className="min-w-0">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{stats.totalReviews}</div>
                <div className="text-xs sm:text-sm text-gray-600 truncate">Total Reviews</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-3 sm:p-4 lg:p-6">
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Star className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
              </div>
              <div className="min-w-0">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{stats.ratingDistribution[5]}</div>
                <div className="text-xs sm:text-sm text-gray-600 truncate">5-Star Reviews</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-3 sm:p-4 lg:p-6">
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
              <div className="min-w-0">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                  {stats.totalReviews > 0 ? Math.round((stats.ratingDistribution[4] + stats.ratingDistribution[5]) / stats.totalReviews * 100) : 0}%
                </div>
                <div className="text-xs sm:text-sm text-gray-600 truncate">Positive Reviews</div>
              </div>
            </div>
          </div>
        </div>

        {/* Rating Distribution */}
        {stats.totalReviews > 0 && (
          <div className="bg-white rounded-xl shadow-sm border p-3 sm:p-4 lg:p-6 mb-6 sm:mb-8">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Rating Distribution</h3>
            <div className="space-y-2 sm:space-y-3">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = stats.ratingDistribution[rating];
                const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                
                return (
                  <div key={rating} className="flex items-center gap-4">
                    <div className="flex items-center gap-1 w-16">
                      <span className="text-sm font-medium">{rating}</span>
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-400" />
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="text-sm text-gray-600 w-16 text-right">
                      {count} ({percentage.toFixed(0)}%)
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-sm border p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search reviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
              />
            </div>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value === "all" ? "all" : Number(e.target.value))}
              className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
            >
              <option value="all">All Ratings</option>
              <option value={5}>5 Stars</option>
              <option value={4}>4 Stars</option>
              <option value={3}>3 Stars</option>
              <option value={2}>2 Stars</option>
              <option value={1}>1 Star</option>
            </select>
          </div>
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-600">Loading reviews...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {reviews.length === 0 ? "No reviews yet" : "No reviews match your filters"}
            </h3>
            <p className="text-gray-500">
              {reviews.length === 0 
                ? "Reviews will appear after buyers rate delivered orders." 
                : "Try adjusting your search or filter criteria."
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {filteredReviews.map((review) => (
              <div key={review._id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow duration-300">
                <div className="p-3 sm:p-4 lg:p-6">
                  <div className="flex flex-col sm:flex-row items-start justify-between mb-3 sm:mb-4 gap-3">
                    <div className="flex items-start gap-2 sm:gap-3 lg:gap-4 flex-1 min-w-0 w-full sm:w-auto">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xs sm:text-sm flex-shrink-0">
                        {review.productId?.name?.slice(0, 2)?.toUpperCase() || "PR"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-1 truncate">{review.productId?.name || "Product"}</h3>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                          {renderStars(review.rating, "sm")}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRatingColor(review.rating)}`}>
                            {review.rating}/5
                          </span>
                          {review.isVerifiedPurchase && (
                            <span className="flex items-center gap-1 text-xs text-green-600">
                              <CheckCircle className="w-3 h-3" />
                              <span className="hidden sm:inline">Verified Purchase</span>
                              <span className="sm:hidden">Verified</span>
                            </span>
                          )}
                        </div>
                        {review.comment && (
                          <p className="text-xs sm:text-sm text-gray-700 mb-2 sm:mb-3 leading-relaxed line-clamp-3">{review.comment}</p>
                        )}
                        
                        {/* Review Photos */}
                        {review.photos && review.photos.length > 0 && (
                          <div className="flex gap-2 mb-2 sm:mb-3">
                            {review.photos.slice(0, 3).map((photo, index) => (
                              <div key={index} className="relative">
                                <img
                                  src={photo.url}
                                  alt={photo.caption || `Review photo ${index + 1}`}
                                  className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                                  onClick={() => window.open(photo.url, '_blank')}
                                />
                                {index === 2 && review.photos!.length > 3 && (
                                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center text-white text-xs font-medium">
                                    +{review.photos!.length - 3}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">{formatDate(review.createdAt)}</span>
                            <span className="sm:hidden">{new Date(review.createdAt).toLocaleDateString('en-IN')}</span>
                          </div>
                          {(review.helpfulVotes || 0) > 0 && (
                            <div className="flex items-center gap-1">
                              <ThumbsUp className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span>{review.helpfulVotes} helpful</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex sm:flex-col items-center sm:items-end gap-2 w-full sm:w-auto">
                      <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600 mb-0 sm:mb-2 flex-1 sm:flex-none">
                        <User className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="truncate">{review.buyerId?.name || "Customer"}</span>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedReview(review);
                          setShowModal(true);
                        }}
                        className="flex items-center gap-1 px-2 sm:px-3 py-1 text-xs sm:text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-300 whitespace-nowrap flex-shrink-0"
                      >
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">View Details</span>
                        <span className="sm:hidden">View</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Review Details Modal */}
        {showModal && selectedReview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Review Details</h2>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setSelectedReview(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="space-y-6">
                  {/* Product Info */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Product</h3>
                    <p className="text-gray-700">{selectedReview.productId?.name}</p>
                  </div>

                  {/* Rating */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Rating</h3>
                    <div className="flex items-center gap-3">
                      {renderStars(selectedReview.rating, "md")}
                      <span className="text-lg font-medium">{selectedReview.rating}/5</span>
                    </div>
                  </div>

                  {/* Comment */}
                  {selectedReview.comment && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Review Comment</h3>
                      <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                        {selectedReview.comment}
                      </p>
                    </div>
                  )}

                  {/* Photos */}
                  {selectedReview.photos && selectedReview.photos.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Photos ({selectedReview.photos.length})</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {selectedReview.photos.map((photo, index) => (
                          <div key={index} className="space-y-2">
                            <img
                              src={photo.url}
                              alt={photo.caption || `Review photo ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => window.open(photo.url, '_blank')}
                            />
                            {photo.caption && (
                              <p className="text-sm text-gray-600">{photo.caption}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Customer Info */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Customer</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-medium">{selectedReview.buyerId?.name}</p>
                      {selectedReview.buyerId?.email && (
                        <p className="text-sm text-gray-600">{selectedReview.buyerId.email}</p>
                      )}
                      <p className="text-sm text-gray-500 mt-2">
                        Reviewed on {formatDate(selectedReview.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Helpfulness */}
                  {((selectedReview.helpfulVotes || 0) > 0 || (selectedReview.unhelpfulVotes || 0) > 0) && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Community Feedback</h3>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-green-600">
                          <ThumbsUp className="w-4 h-4" />
                          <span>{selectedReview.helpfulVotes || 0} helpful</span>
                        </div>
                        <div className="flex items-center gap-1 text-red-600">
                          <ThumbsDown className="w-4 h-4" />
                          <span>{selectedReview.unhelpfulVotes || 0} not helpful</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </VendorLayout>
  );
};

export default VendorFeedback;


