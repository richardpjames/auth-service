import { Navigate, Outlet, useLocation } from 'react-router';
import { useMe } from '../hooks/useMe';
import Loading from '../components/Loading';

// This checks whether the user has admin permission based on the /api/me endpoint
const RequireAdmin = () => {
  const { user, isLoading } = useMe();
  const location = useLocation();

  // While we are fetching data
  if (isLoading) {
    return <Loading />;
  }

  if (!user) {
    // Redirect to the login screen with a returnTo URL
    const returnTo = `${location.pathname}${location.search}`;
    return (
      <Navigate
        to={`/login?returnTo=${encodeURIComponent(returnTo)}`}
        replace
      />
    );
  }

  // If the user is logged in but not an admin, send to the not authorised page
  if (!user.admin) {
    return <Navigate to="/notauthorised" replace />;
  }

  // If everything is fine, then we return the outlet for our layout
  return <Outlet />;
};

export default RequireAdmin;
