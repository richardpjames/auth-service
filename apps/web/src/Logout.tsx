import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import axios from 'axios';
import ErrorMessage from './components/ErrorMessage';

const Logout = () => {
  // To navigate back to the login screen
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  // Run this once navigate has loaded
  useEffect(() => {
    // Call the endpoint to logout
    async function performLogout() {
      try {
        await axios.post('/api/logout');
        // Use replace to stop users coming back to this page
        navigate('/login', {
          replace: true,
          state: {
            message: 'You have been logged out successfully.',
          },
        });
        // Catch any errors so we can output them
      } catch (error) {
        if (axios.isAxiosError<{ message?: string }>(error)) {
          setServerError(
            error.response?.data?.message ??
              'Unable to log you out, please try again.',
          );
          return;
        }

        setServerError('Unable to log you out, please try again.');
      }
    }
    void performLogout();
  }, [navigate]);

  // We should only show anything when there is an error
  return (
    <>
      <ErrorMessage>{serverError}</ErrorMessage>
    </>
  );
};

export default Logout;
