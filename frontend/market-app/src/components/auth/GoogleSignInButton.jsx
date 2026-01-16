import { GoogleLogin } from '@react-oauth/google';
import { authService } from '../../services/authService';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const GoogleSignInButton = ({ onSuccess }) => {
  const { googleLogin } = useAuth();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      // Exchange Google ID token for our JWT
      const data = await authService.googleAuth(credentialResponse.credential);

      // Update auth context (this also stores tokens in localStorage)
      googleLogin(data.user, data.access_token);

      // Store refresh token separately
      if (data.refresh_token) {
        localStorage.setItem('refresh_token', data.refresh_token);
      }

      toast.success('Logged in successfully!');

      if (onSuccess) {
        onSuccess(data);
      }
    } catch (error) {
      console.error('Google login error:', error);
      const errorMessage = error.response?.data?.error?.message || 'Failed to login with Google';
      toast.error(errorMessage);
    }
  };

  const handleGoogleError = () => {
    console.error('Google OAuth error');
    toast.error('Failed to connect with Google');
  };

  return (
    <div className="w-full">
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        useOneTap={false}
        text="continue_with"
        shape="rectangular"
        size="large"
        width="100%"
        theme="outline"
      />
    </div>
  );
};

export default GoogleSignInButton;
