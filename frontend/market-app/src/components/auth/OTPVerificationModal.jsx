import { useState, useEffect } from 'react';
import { FiMail, FiCheck, FiX } from 'react-icons/fi';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { authService } from '../../services/authService';
import toast from 'react-hot-toast';

const OTPVerificationModal = ({ isOpen, onClose, onVerified, userEmail }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleOtpChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();

    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);

      // Focus last input
      const lastInput = document.getElementById('otp-5');
      if (lastInput) lastInput.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');

    if (otpCode.length !== 6) {
      toast.error('Please enter all 6 digits');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.verifyEmail(otpCode);
      toast.success(response.message || 'Email verified successfully!');
      onVerified();
      onClose();
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || 'Invalid verification code';
      toast.error(errorMessage);
      setOtp(['', '', '', '', '', '']);
      document.getElementById('otp-0')?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);

    try {
      const response = await authService.resendVerification();
      toast.success(response.message || 'Verification code sent!');
      setOtp(['', '', '', '', '', '']);
      setCountdown(60); // 60 second cooldown
      document.getElementById('otp-0')?.focus();
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || 'Failed to resend code';
      toast.error(errorMessage);
    } finally {
      setResending(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Verify Your Email"
    >
      <div className="text-center">
        {/* Icon */}
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
          <FiMail className="h-8 w-8 text-primary-600" />
        </div>

        {/* Description */}
        <p className="text-gray-600 mb-6">
          We've sent a 6-digit verification code to<br />
          <span className="font-semibold text-gray-900">{userEmail}</span>
        </p>

        {/* OTP Input */}
        <div className="flex justify-center gap-2 mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
              disabled={loading}
            />
          ))}
        </div>

        {/* Verify Button */}
        <Button
          onClick={handleVerify}
          disabled={loading || otp.join('').length !== 6}
          className="w-full mb-4"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Verifying...
            </>
          ) : (
            <>
              <FiCheck className="mr-2" />
              Verify Email
            </>
          )}
        </Button>

        {/* Resend */}
        <div className="text-sm text-gray-600">
          Didn't receive the code?{' '}
          {countdown > 0 ? (
            <span className="text-gray-400">Resend in {countdown}s</span>
          ) : (
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-primary-600 hover:text-primary-700 font-semibold disabled:opacity-50"
            >
              {resending ? 'Sending...' : 'Resend Code'}
            </button>
          )}
        </div>

        {/* Skip for now */}
        <button
          onClick={onClose}
          className="mt-4 text-sm text-gray-500 hover:text-gray-700"
        >
          I'll verify later
        </button>
      </div>
    </Modal>
  );
};

export default OTPVerificationModal;
