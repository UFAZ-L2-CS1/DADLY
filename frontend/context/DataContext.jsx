import { createContext, useEffect, useState } from 'react';
import { getCurrentUser as loadUser } from '../service/AuthService';

export const dataCntxt = createContext();

const DataContext = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      try {
        const user = await loadUser();
        setCurrentUser(user || null); // user should now be the object
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
    <dataCntxt.Provider value={{ currentUser, setCurrentUser, loading }}>
      {children}
    </dataCntxt.Provider>
  );
};

export default DataContext;
