import { FiCheckCircle } from 'react-icons/fi';

const SuccessMessage = ({ message }) => {
  if (!message) return null;

  return (
    <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-start">
      <FiCheckCircle className="mt-0.5 mr-2 flex-shrink-0" size={20} />
      <span>{message}</span>
    </div>
  );
};

export default SuccessMessage;
