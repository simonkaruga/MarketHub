import { FiAlertCircle } from 'react-icons/fi';

const ErrorMessage = ({ message }) => {
  if (!message) return null;

  return (
    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-start">
      <FiAlertCircle className="mt-0.5 mr-2 flex-shrink-0" size={20} />
      <span>{message}</span>
    </div>
  );
};

export default ErrorMessage;
