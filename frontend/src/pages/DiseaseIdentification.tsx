import React, { useState, useRef } from 'react';
import { Upload, X, Loader2, CheckCircle, AlertCircle, Leaf, Sparkles, ArrowRight, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import FarmerLayout from '../components/FarmerLayout';
import { Layout as LandownerLayout } from './landowner/LandownerDashboard';
import { InvestorLayout } from './investor/InvestorLayout';

interface Treatment {
  active_ingredient: string;
  type: string;
  category: string;
  usage_stage: string;
}

interface PredictionResult {
  plant: string;
  disease: string;
  confidence: number;
  treatments: Treatment[];
}

const DiseaseIdentificationContent: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const clearImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedImage);

    try {
      const response = await fetch('https://agricorus.duckdns.org/predict', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to analyze image');
      }

      const data: PredictionResult = await response.json();
      setResult(data);
    } catch (err) {
      setError('Failed to analyze the image. Please ensure the ML service is running.');
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'chemical':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'organic':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'nutrition':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 70) return 'text-yellow-600';
    return 'text-orange-600';
  };

  return (
    <div className="bg-gradient-to-br from-emerald-50 via-white to-blue-50 py-8 px-4 sm:px-6 lg:px-8 rounded-xl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl mb-4 shadow-lg">
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Plant Disease Identification
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload a photo of your plant to instantly identify diseases and get treatment recommendations powered by AI
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Camera className="w-5 h-5 text-emerald-600" />
                Upload Plant Image
              </h2>

              {!previewUrl ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/50 transition-all duration-300 group"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Upload className="w-10 h-10 text-emerald-600" />
                    </div>
                    <p className="text-lg font-medium text-gray-700 mb-2">
                      Drop your image here or click to browse
                    </p>
                    <p className="text-sm text-gray-500">
                      Supports: JPG, PNG, JPEG (Max 10MB)
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-96 object-cover rounded-xl shadow-lg"
                  />
                  <button
                    onClick={clearImage}
                    className="absolute top-3 right-3 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </motion.div>
              )}

              {previewUrl && !result && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={analyzeImage}
                  disabled={isAnalyzing}
                  className="mt-6 w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Analyze Disease
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </motion.button>
              )}
            </div>
          </motion.div>

          {/* Results Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">Analysis Complete</h2>
                        <p className="text-sm text-gray-500">Results ready</p>
                      </div>
                    </div>
                    <button
                      onClick={clearImage}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg"
                      title="Analyze another image"
                    >
                      <Camera className="w-4 h-4" />
                      <span className="hidden sm:inline">New Analysis</span>
                    </button>
                  </div>

                  {/* Plant & Disease Info */}
                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-5 mb-6 border border-emerald-100">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Plant Type</p>
                        <p className="text-lg font-semibold text-gray-900">{result.plant}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Condition</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {result.disease.replace(/_/g, ' ')}
                        </p>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-emerald-200">
                      <p className="text-sm text-gray-600 mb-2">Confidence Level</p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${result.confidence}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className="h-full bg-gradient-to-r from-emerald-500 to-green-600"
                          />
                        </div>
                        <span className={`text-lg font-bold ${getConfidenceColor(result.confidence)}`}>
                          {result.confidence.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Treatments */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-emerald-600" />
                      Recommended Treatments
                    </h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                      {result.treatments.map((treatment, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-gray-900">{treatment.active_ingredient}</h4>
                            <span className={`text-xs px-2 py-1 rounded-full border ${getCategoryColor(treatment.category)}`}>
                              {treatment.category}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-500">Type:</span>
                              <span className="ml-2 text-gray-700 font-medium">{treatment.type}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Stage:</span>
                              <span className="ml-2 text-gray-700 font-medium">{treatment.usage_stage}</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={clearImage}
                    className="mt-6 w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <Camera className="w-5 h-5" />
                    Analyze Another Image
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 h-full flex items-center justify-center"
                >
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Leaf className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No Analysis Yet
                    </h3>
                    <p className="text-gray-500">
                      Upload an image to get started with disease identification
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 grid md:grid-cols-3 gap-6"
        >
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">AI-Powered</h3>
            <p className="text-sm text-gray-600">
              Advanced machine learning models trained on thousands of plant diseases
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Instant Results</h3>
            <p className="text-sm text-gray-600">
              Get accurate disease identification and treatment recommendations in seconds
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Leaf className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Expert Guidance</h3>
            <p className="text-sm text-gray-600">
              Receive detailed treatment plans with organic and chemical options
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Wrapper component that applies the correct layout based on user role
const DiseaseIdentification: React.FC = () => {
  const role = localStorage.getItem('role');

  // Render with appropriate layout based on role
  if (role === 'farmer') {
    return (
      <FarmerLayout>
        <DiseaseIdentificationContent />
      </FarmerLayout>
    );
  }

  if (role === 'landowner') {
    return (
      <LandownerLayout>
        <DiseaseIdentificationContent />
      </LandownerLayout>
    );
  }

  if (role === 'investor') {
    return (
      <InvestorLayout>
        <DiseaseIdentificationContent />
      </InvestorLayout>
    );
  }

  // Fallback: render without layout if role is not recognized
  return <DiseaseIdentificationContent />;
};

export default DiseaseIdentification;
