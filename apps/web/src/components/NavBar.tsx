import { Link } from 'react-router';

const NavBar = () => {
  const links = [
    { text: 'Users', to: '/admin/users' },
    { text: 'Client Apps', to: '/admin/clientapps' },
  ];

  return (
    <div className="navbar shadow-xl">
      <div className="navbar-start font-bold font-sans text-black">
        <Link to="/admin">Auth Service</Link>
      </div>
      <div className="navbar-center">
        {links.map((link) => {
          return (
            <Link to={link.to} className="btn btn-neutral mx-2" key={link.text}>
              {link.text}
            </Link>
          );
        })}
      </div>
      <div className="navbar-end">
        <Link className="btn btn-error" to="/logout">
          Log Out
        </Link>
      </div>
    </div>
  );
};
export default NavBar;
