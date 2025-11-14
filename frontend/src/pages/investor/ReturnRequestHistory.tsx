// src/pages/investor/ReturnRequestHistory.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { InvestorLayout } from "./InvestorLayout";
import { Layout } from "lucide-react"; // Note: 'Layout' from 'lucide-react' is imported but not used, I've left it as is.

interface ReturnRequest {
  _id: string;
  investmentId: string;
  // UPDATED: payoutMethodId can be an object with _id or null
  payoutMethodId: { _id: string } | null; 
  status: string; // NEW: Added status based on the response
  createdAt: string;
}

const ReturnRequestHistory: React.FC = () => {
  const [requests, setRequests] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token"); // JWT token
        const res = await axios.get(
          "http://localhost:5000/api/investor/return-requests",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        // Ensure data is correctly typed and state is set
        setRequests(res.data.returnRequests as ReturnRequest[]);
      } catch (err: any) {
        console.error(err);
        toast.error(
          err.response?.data?.message || "Failed to fetch return request history"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  // Helper function to render status with basic styling
  const renderStatus = (status: string) => {
    let style = "px-2 py-0.5 rounded-full text-xs font-medium";
    let text = status.charAt(0).toUpperCase() + status.slice(1); // Capitalize first letter

    switch (status.toLowerCase()) {
      case 'pending':
        style += ' bg-yellow-100 text-yellow-800';
        break;
      case 'approved':
        style += ' bg-green-100 text-green-800';
        break;
      case 'rejected':
        style += ' bg-red-100 text-red-800';
        break;
      default:
        style += ' bg-gray-100 text-gray-800';
        break;
    }

    return <span className={style}>{text}</span>;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full py-20">
        <p className="text-gray-500 text-lg">Loading your return request history...</p>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="flex justify-center items-center h-full py-20">
        <p className="text-gray-500 text-lg">You have not submitted any return requests yet.</p>
      </div>
    );
  }

  return (
    <InvestorLayout>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Return Request History</h1>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b text-left">#</th>
                <th className="py-2 px-4 border-b text-left">Investment ID</th>
                <th className="py-2 px-4 border-b text-left">Payout Method ID</th>
                <th className="py-2 px-4 border-b text-left">Status</th> {/* NEW COLUMN */}
                <th className="py-2 px-4 border-b text-left">Submitted At</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req, index) => (
                <tr key={req._id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{index + 1}</td>
                  <td className="py-2 px-4 border-b font-mono text-sm">{req.investmentId}</td>
                  <td className="py-2 px-4 border-b font-mono text-sm">
                    {/* UPDATED: Safely access _id or display a message if null */}
                    {req.payoutMethodId ? req.payoutMethodId._id : 'N/A (Method Missing)'}
                  </td>
                  {/* NEW CELL for Status */}
                  <td className="py-2 px-4 border-b">
                    {renderStatus(req.status)}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {new Date(req.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </InvestorLayout>
  );
};

export default ReturnRequestHistory;