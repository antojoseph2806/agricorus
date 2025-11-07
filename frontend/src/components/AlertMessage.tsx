// components/AlertMessage.tsx
import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";

interface AlertMessageProps {
  type: "success" | "error" | "warning";
  message: string;
  onClose: () => void;
}

const iconMap = {
  success: <CheckCircle className="h-5 w-5 text-green-600" />,
  error: <XCircle className="h-5 w-5 text-red-600" />,
  warning: <AlertTriangle className="h-5 w-5 text-yellow-600" />,
};

const bgMap = {
  success: "bg-green-50 border-green-400 text-green-800",
  error: "bg-red-50 border-red-400 text-red-800",
  warning: "bg-yellow-50 border-yellow-400 text-yellow-800",
};

const AlertMessage: React.FC<AlertMessageProps> = ({ type, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000); // auto dismiss after 4s
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`flex items-center p-3 mb-4 border rounded-lg shadow-sm ${bgMap[type]}`}
    >
      {iconMap[type]}
      <span className="ml-2 text-sm font-medium">{message}</span>
      <button
        onClick={onClose}
        className="ml-auto text-gray-500 hover:text-gray-700"
      >
        ✕
      </button>
    </motion.div>
  );
};

export default AlertMessage;
