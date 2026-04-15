import { Outlet } from 'react-router';
import NavBar from '../components/NavBar';

const AdminLayout = () => {
  return (
    <>
      <NavBar />
      <div className="flex h-screen flex-col max-w-5xl mx-auto">
        <div className="w-full mt-5 px-5">
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default AdminLayout;
