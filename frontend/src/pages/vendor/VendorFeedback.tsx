import { useEffect, useState } from "react";
import axios from "axios";
import VendorLayout from "./VendorLayout";
import { Star, User, Package } from "lucide-react";

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
}

const VendorFeedback = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${(import.meta as any).env.VITE_BACKEND_URL || "http://localhost:5000"}/api/vendor/reviews`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data.success) {
        setReviews(response.data.data || response.data.reviews || []);
      } else {
        setError(response.data.message || "Failed to load reviews");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i <= rating ? "text-yellow-500 fill-yellow-400" : "text-gray-300"}`}
          />
        ))}
      </div>
    );
  };

  return (
    <VendorLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Ratings & Reviews</h1>
          <p className="text-gray-600">See what buyers are saying about your products.</p>
        </div>

        {loading ? (
          <div className="text-gray-600">Loading reviews...</div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-700 font-medium">No reviews yet</p>
            <p className="text-gray-500 text-sm">Reviews will appear after buyers rate delivered orders.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((rev) => (
              <div key={rev._id} className="bg-white rounded-lg shadow-sm border p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-600">
                      {rev.productId?.name?.slice(0, 2)?.toUpperCase() || "PR"}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{rev.productId?.name || "Product"}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        {renderStars(rev.rating)}
                        <span>{rev.rating}/5</span>
                      </div>
                      {rev.comment && <p className="text-gray-700 text-sm mt-2">{rev.comment}</p>}
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(rev.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    <div className="flex items-center gap-1 justify-end">
                      <User className="w-4 h-4" />
                      <span>{rev.buyerId?.name || "Buyer"}</span>
                    </div>
                    {rev.buyerId?.email && <div className="text-xs text-gray-500">{rev.buyerId.email}</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </VendorLayout>
  );
};

export default VendorFeedback;


