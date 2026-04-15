import { Link, useLocation } from 'react-router';

const LoggedIn = () => {
  // Used to get any query params
  const location = useLocation();
  const { search } = location;
  // Return a simple form to allow the user to log out
  return (
    <div className="flex flex-col w-full">
      <h1>Welcome Back!</h1>
      <p>
        You are already logged in, but you can use the button below to log out
        again.
      </p>
      <div>
        <Link to={`/logout${search}`} className="btn btn-primary">
          Log Out
        </Link>
      </div>
    </div>
  );
};

export default LoggedIn;
