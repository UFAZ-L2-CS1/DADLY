import logoDadly from '../assets/logoDadly.png'
import React, { useState } from "react";
import { Link, useNavigate } from 'react-router-dom'
import { signIn } from '../../service/AuthService.js';

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
  const navigate = useNavigate()

  // validate email
  function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleUser();
    if (Object.keys(errors).length === 0) {
      console.log("Sign in with", formData);
    }
  };

  async function handleUser() {
    const newErrors = {};

    setTouched({
      email: true,
      password: true,
    });

    if (formData.email.length === 0) {
      newErrors.email = "Enter your email address";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (formData.password.length === 0) {
      newErrors.password = "Enter your password";
    } else if (formData.password.length < 8) {
      newErrors.password = "Passwords must be at least 8 characters.";
    }

    setErrors(newErrors);

    try {
      const loggedInUser = await signIn(formData);

      if (loggedInUser) {
        navigate('/');

        localStorage.setItem("user", JSON.stringify({
          id: loggedInUser.id,
          email: loggedInUser.email
        }));
        console.log("Uğurla daxil oldunuz!");
      }
    } catch (error) {
      if (error.message === "Belə bir hesab tapılmadı") {
        alert("Bu e-poçt ünvanı ilə hesab yoxdur!");
      } else if (error.message === "Şifrə yanlışdır") {
        alert("Daxil etdiyiniz şifrə yanlışdır!");
      } else {
        alert("Daxil olarkən xəta baş verdi!");
      }
    }
  }

  return (
    <div className="flex flex-col items-center justify-center gap-10 px-[0.75rem] ">
      <Link to='/'> <img src={logoDadly} className="w-30" alt="DADLY Logo" /></Link>

      <div className="rounded-md px-6 py-8 border border-[#00000027] md:w-[22rem] flex flex-col gap-5 shadow-sm">
        <h2 className="text-2xl font-semibold">Sign in</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <span className="flex flex-col gap-1">
            <label htmlFor="email" className="font-bold text-sm">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`px-2 py-2 rounded-md border ${errors.email && touched.email ? "border-red-500 border-2" : "border-gray-300"
                }`}
            />
            {errors.email && touched.email && (
              <span className="flex gap-2 pt-1">
                <p className="rounded-full text-white p-2 bg-red-500 w-4 h-4 font-bold flex items-center justify-center text-[0.7rem]">
                  !
                </p>
                <p className="text-[0.7rem] text-red-600">{errors.email}</p>
              </span>
            )}
          </span>

          <span className="flex flex-col gap-1">
            <label htmlFor="password" className="font-bold text-sm">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`px-2 py-2 rounded-md border ${errors.password && touched.password ? "border-red-500 border-2" : "border-gray-300"
                }`}
            />

            {!errors.password && !touched.password && (
              <span className="flex gap-2 pt-1">
                <p className="rounded-full text-white p-2 bg-[#0e63be] w-4 h-4 flex font-bold items-center justify-center text-[0.7rem]">
                  i
                </p>
                <p className="text-[0.7rem]">Passwords must be at least 8 characters.</p>
              </span>
            )}

            {errors.password && touched.password && (
              <span className="flex gap-2 pt-1">
                <p className="rounded-full text-white p-2 bg-red-500 w-4 h-4 font-bold flex items-center justify-center text-[0.7rem]">
                  !
                </p>
                <p className="text-[0.7rem] text-red-600">{errors.password}</p>
              </span>
            )}
          </span>

          <button
            onClick={handleUser}
            type="submit"
            className="p-2 text-[.875rem] w-full rounded-full text-white bg-[#EB7A30]  cursor-pointer"
          >
            Sign in
          </button>

          <div className="flex items-center justify-center relative mt-4">
            <hr className="text-[#00000027] w-full" />
            <p className="text-sm text-[#00000080] absolute bg-white px-2">New to DADLY?</p>
          </div>

          <Link to='/register' ><button className="w-full border border-gray-400 rounded-full cursor-pointer py-2 hover:bg-gray-100">
            Create your DADLY account
          </button>
          </Link>
        </form>
      </div>
      <hr className='text-[#00000037] w-full' />

      <div className="mt-8 text-sm text-gray-500 text-center space-x-4">
        <a href="#" className="text-[#0e63be] hover:underline">
          Help
        </a>
        <a href="#" className="text-[#0e63be] hover:underline">
          Conditions of Use
        </a>
        <a href="#" className="text-[#0e63be] hover:underline">
          Privacy Notice
        </a>
        <p className="mt-2">© 2025</p>
      </div>
    </div>
  );
}
