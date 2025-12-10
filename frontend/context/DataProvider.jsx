import { useEffect, useState } from 'react';
import DataContext from './DataContext';
import { getCurrentUser as loadUser } from '../service/AuthService';

const DataProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      try {
        const user = await loadUser();
        setCurrentUser(user || null);
      } catch (err) {
        console.error('Failed to load user:', err);
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  return (
    <DataContext.Provider value={{ currentUser, setCurrentUser, loading }}>
      {children}
    </DataContext.Provider>
  );
};

export default DataProvider;
