import React, { useState, useContext } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { login, getLikedUser, getCurrentUser } from '../../service/AuthService.js'; // your AuthService login function
import AuthShowcase from '../components/AuthShowcase.jsx';
import DataContext from '../../context/DataContext';

export default function SignIn() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });
  const baseInputClasses = 'px-4 py-3 rounded-2xl border border-[#f2d8bf] bg-[#fffdfb] focus:border-[#EB7A30] focus:ring-2 focus:ring-[#ffe3ce] outline-none transition-all duration-200';
  const { setCurrentUser } = useContext(DataContext);
  const navigate = useNavigate();

  // Email validation
  function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleUser = async (e) => {
    e.preventDefault();

    const newErrors = {};
    setTouched({ email: true, password: true });

    // Validation
    if (!formData.email) newErrors.email = "Enter your email address";
    else if (!validateEmail(formData.email)) newErrors.email = "Enter a valid email address";

    if (!formData.password) newErrors.password = "Enter your password";
    else if (formData.password.length < 8) newErrors.password = "Passwords must be at least 8 characters.";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      // Call AuthService login function
      const data = await login(formData.email, formData.password);
      const likeds=await getLikedUser()
      if (data) {
        // Save tokens in localStorage
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);

        try {
          const profile = await getCurrentUser();
          if (profile) {
            setCurrentUser(profile);
            localStorage.setItem('user', JSON.stringify(profile));
          } else {
            setCurrentUser({ email: formData.email });
            localStorage.setItem('user', JSON.stringify({ email: formData.email }));
          }
        } catch (profileErr) {
          console.error('Failed to load profile after login:', profileErr);
          setCurrentUser({ email: formData.email });
          localStorage.setItem('user', JSON.stringify({ email: formData.email }));
        }

        console.log("Uğurla daxil oldunuz!");
        console.log(likeds)
        navigate('/');
      }
    } catch (error) {
      // Handle API errors based on messages from AuthService
      const msg = error.response?.data?.detail || error.message;
      if (msg.includes("No active account")) {
        alert("Bu e-poçt ünvanı ilə hesab yoxdur!");
      } else if (msg.includes("Incorrect password")) {
        alert("Daxil etdiyiniz şifrə yanlışdır!");
      } else {
        alert("Daxil olarkən xəta baş verdi!");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#fffaf6] flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-5xl grid gap-0 grid-cols-[1.05fr,0.95fr] md:flex rounded-[42px] overflow-hidden border border-[#f4decd] bg-white shadow-[0_30px_90px_rgba(201,142,102,0.22)]">
        <div className="bg-white px-6 sm:px-10 py-10 flex flex-col gap-8">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.4em] text-[#d28b63]">Tap back in</p>
            <h2 className="text-3xl font-semibold tracking-tight">Sign in</h2>
            <p className="text-sm text-[#6d5242]">Unlock your saved recipes, pantry alerts, and personalized feeds.</p>
            <div className="flex flex-wrap gap-2">
              {['Spicy tonight', 'Comfort cravings', 'Quick prep'].map((tag) => (
                <span key={tag} className="rounded-full border border-[#f5d1b6] px-3 py-1 text-xs text-[#b47747] bg-[#fff8f0]">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <form onSubmit={handleUser} className="space-y-4">
            {/* Email */}
            <span className="flex flex-col gap-1">
              <label htmlFor="email" className="font-bold text-sm">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`${baseInputClasses} ${errors.email && touched.email ? "border-red-500 border-2 bg-red-50" : ""}`}
              />
              {errors.email && touched.email && (
                <span className="flex gap-2 pt-1">
                  <p className="rounded-full text-white p-2 bg-red-500 w-4 h-4 font-bold flex items-center justify-center text-[0.7rem]">!</p>
                  <p className="text-[0.7rem] text-red-600">{errors.email}</p>
                </span>
              )}
            </span>

            {/* Password */}
            <span className="flex flex-col gap-1">
              <label htmlFor="password" className="font-bold text-sm">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`${baseInputClasses} ${errors.password && touched.password ? "border-red-500 border-2 bg-red-50" : ""}`}
              />
              {!errors.password && !touched.password && (
                <span className="flex gap-2 pt-1">
                  <p className="rounded-full text-white p-2 bg-[#0e63be] w-4 h-4 flex font-bold items-center justify-center text-[0.7rem]">i</p>
                  <p className="text-[0.7rem]">Passwords must be at least 8 characters.</p>
                </span>
              )}
              {errors.password && touched.password && (
                <span className="flex gap-2 pt-1">
                  <p className="rounded-full text-white p-2 bg-red-500 w-4 h-4 font-bold flex items-center justify-center text-[0.7rem]">!</p>
                  <p className="text-[0.7rem] text-red-600">{errors.password}</p>
                </span>
              )}
            </span>

            <button
              type="submit"
              className="p-3 text-[.95rem] w-full rounded-full text-white bg-gradient-to-r from-[#f2c29a] via-[#ecab84] to-[#e3875a] cursor-pointer shadow-[0_15px_32px_rgba(202,128,85,0.35)] transition-transform duration-200 hover:-translate-y-0.5"
            >
              Sign in
            </button>

            <div className="flex items-center justify-center relative mt-4">
              <hr className="text-[#00000020] w-full" />
              <p className="text-sm text-[#6e5d53] absolute bg-white px-2">New to DADLY?</p>
            </div>

            <Link to='/auth/register'>
              <button className="w-full border border-[#f5d1b6] rounded-full cursor-pointer py-2 hover:bg-[#fff8f0] transition-colors duration-200">
                Create your DADLY account
              </button>
            </Link>
          </form>
        </div>
        <AuthShowcase variant="signin" />
      </div>
    </div>
  );
}
