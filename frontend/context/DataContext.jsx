import { createContext, useEffect, useState } from "react";
// import { getMenuData, getSwiperData, getMovieData, getMoreExploreData } from "../service/Data";
import { loadUser } from "../service/AuthService"; // your combined function

export const dataCntxt = createContext();

const DataContext = ({ children }) => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // const [menuData, setMenuData] = useState([]);
  // const [moreExploreData, setMoreExploreData] = useState([]);
  // const [swiperData, setSwiperData] = useState([]);
  // const [movieData, setMovieData] = useState([]);
 const [currentUser, setCurrentUser] = useState(null);

useEffect(() => {
  async function fetchUser() {
    try {
      const user = await loadUser();
      if (user && user.length > 0) {
        setCurrentUser(user[0]);
      } else {
        setCurrentUser(null);
      }
    } catch (err) {
      console.error("Failed to load user:", err);
      setCurrentUser(null);
    }
  }

  fetchUser();
}, []);


  // useEffect(() => {
  //   getMenuData()
  //     .then(item => setMenuData(item))
  //     .catch(err => setError(err))
  //     .finally(() => setLoading(false));
  //     getMoreExploreData()
  //     .then(item => setMoreExploreData(item))
  //     .catch(err => setError(err))
  //     .finally(() => setLoading(false));
  //      getSwiperData()
  //     .then(item => setSwiperData(item))
  //     .catch(err => setError(err))
  //     .finally(() => setLoading(false));
  //         getMovieData()
  //     .then(item => setMovieData(item))
  //     .catch(err => setError(err))
  //     .finally(() => setLoading(false));
  // }, []);



  return (
    <dataCntxt.Provider
      value={{
        // menuData,
        // swiperData,
        // movieData,
        // moreExploreData,
        currentUser,
        setCurrentUser,
        loading,
        error,
      }}
    >
      {children}
    </dataCntxt.Provider>
  );
};

export default DataContext;
