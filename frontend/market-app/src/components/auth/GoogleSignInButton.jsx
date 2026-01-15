import { GoogleLogin } from '@react-oauth/google';
import { authService } from '../../services/authService';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const GoogleSignInButton = ({ onSuccess }) => {
  const { login: authLogin } = useAuth();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      // Exchange Google ID token for our JWT
      const data = await authService.googleAuth(credentialResponse.credential);

      // Store tokens and user data
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Update auth context
      authLogin(data.user, data.access_token);

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
