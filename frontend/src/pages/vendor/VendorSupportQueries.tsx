import { useEffect, useState } from 'react';
import axios from 'axios';
import VendorLayout from './VendorLayout';
import { MessageCircle, Send, Clock, CheckCircle, XCircle, Loader2, User, Package, FileText } from 'lucide-react';

interface Message {
  message: string;
  sender: 'user' | 'vendor';
  timestamp: Date;
}

interface SupportQuery {
  _id: string;
  userId: { _id: string; name: string; email: string };
  userRole: string;
  orderId?: { _id: string; orderNumber: string };
  productId?: { _id: string; name: string };
  messages: Message[];
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  lastMessageAt: Date;
  createdAt: Date;
}

export default function VendorSupportQueries() {
  const [queries, setQueries] = useState<SupportQuery[]>([]);
  const [selectedQuery, setSelectedQuery] = useState<SupportQuery | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchQueries();
  }, [filterStatus]);

  const fetchQueries = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
      
      const response = await axios.get(
        `${backendUrl}/api/marketplace/support/vendor/queries?status=${filterStatus}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setQueries(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching queries:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendReply = async () => {
    if (!replyMessage.trim() || !selectedQuery) return;

    try {
      setSending(true);
      const token = localStorage.getItem('token');
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
      
      const response = await axios.post(
        `${backendUrl}/api/marketplace/support/vendor/reply`,
        {
          queryId: selectedQuery._id,
          message: replyMessage.trim()
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setReplyMessage('');
        fetchQueries();
        // Update selected query
        const updatedQuery = response.data.data;
        setSelectedQuery(updatedQuery);
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const updateStatus = async (queryId: string, status: string) => {
    try {
      const token = localStorage.getItem('token');
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
      
      await axios.patch(
        `${backendUrl}/api/marketplace/support/vendor/status`,
        { queryId, status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      fetchQueries();
      if (selectedQuery?._id === queryId) {
        setSelectedQuery({ ...selectedQuery, status: status as any });
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <Clock className="w-4 h-4" />;
      case 'in_progress': return <MessageCircle className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'closed': return <XCircle className="w-4 h-4" />;
      default: return <MessageCircle className="w-4 h-4" />;
    }
  };

  return (
    <VendorLayout>
      <div className="p-3 sm:p-4 lg:p-6">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Customer Support Queries</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage and respond to customer inquiries</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
          {['all', 'open', 'in_progress', 'resolved', 'closed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium capitalize transition-colors ${
                filterStatus === status
                  ? 'bg-green-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-green-300'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Queries List */}
          <div className="lg:col-span-1 bg-white rounded-xl border overflow-hidden">
            <div className="p-3 sm:p-4 border-b bg-gray-50">
              <h2 className="text-sm sm:text-base font-semibold text-gray-800">Queries ({queries.length})</h2>
            </div>
            <div className="overflow-y-auto max-h-[400px] sm:max-h-[600px]">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 text-green-600 animate-spin" />
                </div>
              ) : queries.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No queries found</p>
                </div>
              ) : (
                queries.map((query) => (
                  <button
                    key={query._id}
                    onClick={() => setSelectedQuery(query)}
                    className={`w-full p-3 sm:p-4 border-b hover:bg-gray-50 transition-colors text-left ${
                      selectedQuery?._id === query._id ? 'bg-green-50 border-l-4 border-l-green-600' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2 gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-semibold flex-shrink-0">
                          {query.userId.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 text-xs sm:text-sm truncate">{query.userId.name}</p>
                          <p className="text-xs text-gray-500 capitalize truncate">{query.userRole}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${getStatusColor(query.status)}`}>
                        {getStatusIcon(query.status)}
                        <span className="hidden sm:inline">{query.status.replace('_', ' ')}</span>
                      </span>
                    </div>
                    
                    {query.orderId && (
                      <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                        <FileText className="w-3 h-3" />
                        Order: {query.orderId.orderNumber}
                      </div>
                    )}
                    
                    {query.productId && (
                      <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
                        <Package className="w-3 h-3" />
                        {query.productId.name}
                      </div>
                    )}
                    
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {query.messages[query.messages.length - 1]?.message}
                    </p>
                    
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(query.lastMessageAt).toLocaleString('en-IN')}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat View */}
          <div className="lg:col-span-2 bg-white rounded-xl border flex flex-col">
            {selectedQuery ? (
              <>
                {/* Header */}
                <div className="p-3 sm:p-4 border-b bg-gray-50">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-800 text-sm sm:text-base truncate">{selectedQuery.userId.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">{selectedQuery.userId.email}</p>
                    </div>
                    <select
                      value={selectedQuery.status}
                      onChange={(e) => updateStatus(selectedQuery._id, e.target.value)}
                      className="w-full sm:w-auto px-2 sm:px-3 py-1.5 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                  
                  {selectedQuery.orderId && (
                    <div className="mt-2 text-xs sm:text-sm text-gray-600 truncate">
                      Order: {selectedQuery.orderId.orderNumber}
                    </div>
                  )}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 sm:space-y-3 bg-gray-50 max-h-[300px] sm:max-h-[400px]">
                  {selectedQuery.messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${msg.sender === 'vendor' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                          msg.sender === 'vendor'
                            ? 'bg-green-600 text-white rounded-br-sm'
                            : 'bg-white text-gray-800 rounded-bl-sm border border-gray-200'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                        <p
                          className={`text-xs mt-1 ${
                            msg.sender === 'vendor' ? 'text-green-100' : 'text-gray-400'
                          }`}
                        >
                          {new Date(msg.timestamp).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Reply Input */}
                <div className="p-3 sm:p-4 border-t bg-white">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <textarea
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Type your reply..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none text-xs sm:text-sm"
                      rows={3}
                      disabled={sending || selectedQuery.status === 'closed'}
                    />
                    <button
                      onClick={sendReply}
                      disabled={!replyMessage.trim() || sending || selectedQuery.status === 'closed'}
                      className="px-3 sm:px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base"
                    >
                      {sending ? (
                        <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Select a query to view conversation</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </VendorLayout>
  );
}
