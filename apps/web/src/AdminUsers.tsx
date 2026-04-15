import { useEffect, useState } from 'react';
import Loading from './components/Loading';
import axios from 'axios';
import moment from 'moment';

interface User {
  id: string;
  email: string;
  displayName: string;
  passwordHash: string;
  admin: boolean;
  createdAt: Date;
  updatedAt: Date;
  disabledAt: Date;
}

const AdminUsers = () => {
  // State for storing all of our users
  const [users, setUsers] = useState<User[]>();
  const [isLoading, setIsLoading] = useState(true);

  // Load our users on page render
  useEffect(() => {
    // The function that will actually load our users (async)
    async function loadUsers() {
      try {
        // Get the users from the API (at this point we should be an authorised admin)
        const response = await axios.get('/api/users');
        // Set the users
        setUsers(response.data);
      } catch (error) {
        console.log(error);
      }
      setIsLoading(false);
    }
    // Call the loading of the users
    loadUsers();
  }, []);
  // If the page is loading then return the loading spinner
  if (isLoading) return <Loading />;
  // If the page is not loading then render it
  return (
    <>
      <h1>Current Users</h1>
      <table className="table mb-5">
        <thead>
          <tr>
            <th>Email</th>
            <th>Display Name</th>
            <th>Admin</th>
            <th>Created At</th>
            <th>Updated At</th>
            <th>Disabled At</th>
            <th></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {users!.map((user) => {
            return (
              <tr key={user.id}>
                <td>{user.email}</td>
                <td>{user.displayName}</td>
                <td>{user.admin ? 'Yes' : 'No'}</td>
                <td>{moment(user.createdAt).format('DD/MM/YYYY@HH:mm')}</td>
                <td>{moment(user.updatedAt).format('DD/MM/YYYY@HH:mm')}</td>
                <td>
                  {user.disabledAt
                    ? moment(user.disabledAt).format('DD/MM/YYYY@HH:mm')
                    : 'N/A'}
                </td>
                <td>
                  <button disabled className="btn btn-error">
                    Disable
                  </button>
                </td>
                <td>
                  <button disabled className="btn btn-error">
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
};

export default AdminUsers;
