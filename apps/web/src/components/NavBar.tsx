import { Link } from 'react-router';

const NavBar = () => {
  const links = [
    { text: 'Users', to: '/admin/users' },
    { text: 'Clients', to: '/admin/clients' },
  ];

  return (
    <div className="navbar bg-primary">
      <div className="navbar-start font-bold font-sans text-white">
        <Link to="/admin">Auth Service</Link>
      </div>
      <div className="navbar-center">
        {links.map((link) => {
          return (
            <Link to={link.to} className="btn btn-neutral mx-2">
              {link.text}
            </Link>
          );
        })}
      </div>
      <div className="navbar-end">
        <Link className="btn btn-secondary" to="/logout">
          Log Out
        </Link>
      </div>
    </div>
  );
};
export default NavBar;
