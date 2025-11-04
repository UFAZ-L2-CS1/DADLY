import { AuthInstance } from '../src/AxiosInstance'

const checkEmailExists = async (email) => {
    try {
        const res = await AuthInstance.get(`/users?email=${email}`);

        if (res.data.length > 0) {
            throw new Error("Bu e-poçt ünvanında hesab artıq mövcuddur");
        }

        return false;
    } catch (error) {
        if (error.message === "Bu e-poçt ünvanında hesab artıq mövcuddur") {
            throw error;
        }
        console.error("Error checking email:", error);
        throw new Error("Email yoxlanılarkən xəta baş verdi");
    }
};

async function signUp(user) {
    try {
        await checkEmailExists(user.email);

        const newUser = await AuthInstance.post('/users', user);
        return newUser;
    } catch (error) {
        console.error("Sign up error:", error.message);
        throw error;
    }
}

async function signIn({ email, password }) {
    try {

        const res = await AuthInstance.get(`/users?email=${email}`);

        if (res.data.length === 0) {
            throw new Error("Belə bir hesab tapılmadı");
        }

        const user = res.data[0];


        if (user.password !== password) {
            throw new Error("Şifrə yanlışdır");
        }

        return user;
    } catch (error) {
        console.error("Sign in error:", error.message);
        throw error;
    }
}
 async function loadUser() {
  try {
    const stored = localStorage.getItem("user");
    if (!stored) return null;

    const { email } = JSON.parse(stored);
    const res = await AuthInstance.get(`/users?email=${email}`);

    return res.data;
  } catch (err) {
    console.error("Error loading user:", err);
    throw err;
  }
}
//  async function updateWatchList(userId, newWatchList) {
//   try {
//     const res = await AuthInstance.patch(`/users/${userId}`, {
//       watchList: newWatchList,
//     });

//     return res.data;
//   } catch (err) {
//     console.error("Error updating watchlist:", err);
//     throw err;
//   }
// }
//  async function updateWatchHistory(userId, newWatchHistory) {
//   try {
//     const res = await AuthInstance.patch(`/users/${userId}`, {
//       watchHistory: newWatchHistory,
//     });

//     return res.data;
//   } catch (err) {
//     console.error("Error updating watchhistory:", err);
//     throw err;
//   }
// }
//  async function updateRateHistory(userId, newRateHistory) {
//   try {
//     const res = await AuthInstance.patch(`/users/${userId}`, {
//       rateHistory: newRateHistory,
//     });

//     return res.data;
//   } catch (err) {
//     console.error("Error updating ratehistory:", err);
//     throw err;
//   }
// export { signUp, signIn ,loadUser,updateWatchList,updateWatchHistory,updateRateHistory}

export { signUp, signIn ,loadUser}