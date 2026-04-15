import { Outlet } from 'react-router';

const AuthLayout = () => {
  return (
    <div className="flex h-screen flex-col max-w-5xl mx-auto">
      <div className="w-full mt-5 px-5">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
