import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../../service/AuthService.js';
import { GoAlertFill } from "react-icons/go";
import AuthShowcase from '../components/AuthShowcase.jsx';

const Register = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    name: '',
    email: '',
    password: '',
    rePassword: '',
    dietaryType: 'none', // default
    allergies: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState('');
  const baseInputClasses = 'px-4 py-3 rounded-2xl border border-[#f2d8bf] bg-[#fffdfb] focus:border-[#EB7A30] focus:ring-2 focus:ring-[#ffe3ce] outline-none transition-all duration-200 placeholder:text-sm';

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleInp = (field, value) => {
    setUser(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));

    let errorMsg = '';
    switch (field) {
      case 'name':
        if (!value.trim()) errorMsg = 'Enter your name';
        break;
      case 'email':
        if (!value) errorMsg = 'Enter your email address';
        else if (!validateEmail(value)) errorMsg = 'Enter a valid email address';
        break;
      case 'password':
        if (!value) errorMsg = 'Enter your password';
        else if (value.length < 8) errorMsg = 'Passwords must be at least 8 characters';
        if (user.rePassword && user.rePassword !== value) {
          setErrors(prev => ({ ...prev, rePassword: 'Passwords do not match' }));
        } else if (user.rePassword && user.rePassword === value) {
          setErrors(prev => ({ ...prev, rePassword: '' }));
        }
        break;
      case 'rePassword':
        if (!value) errorMsg = 'Re-enter your password';
        else if (value !== user.password) errorMsg = 'Passwords do not match';
        break;
      default:
        break;
    }

    setErrors(prev => ({ ...prev, [field]: errorMsg }));
  };

  const handleUser = async (e) => {
    e.preventDefault();

    // mark all fields as touched
    setTouched({
      name: true,
      email: true,
      password: true,
      rePassword: true,
    });

    // validate all fields
    const newErrors = {};
    if (!user.name.trim()) newErrors.name = 'Enter your name';
    if (!user.email) newErrors.email = 'Enter your email address';
    else if (!validateEmail(user.email)) newErrors.email = 'Enter a valid email address';
    if (!user.password) newErrors.password = 'Enter your password';
    else if (user.password.length < 8) newErrors.password = 'Passwords must be at least 8 characters';
    if (!user.rePassword) newErrors.rePassword = 'Re-enter your password';
    else if (user.rePassword !== user.password) newErrors.rePassword = 'Passwords do not match';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      // Call registerUser from AuthService
      await registerUser(user);
        

      console.log('Uğurla qeydiyyatdan keçdiniz!');
      navigate('/auth/token');
    } catch (err) {
      const msg = err.response?.data?.detail || err.message;
      if (msg.includes("already exists")) {
        setServerError(`An account already exists with the email address ${user.email}`);
      } else {
        setServerError("An error occurred during registration!");
      }
    }
  };

  return (
    <div className='min-h-screen bg-[#fffaf6] flex items-center justify-center py-10 px-4'>
      <div className='w-full max-w-6xl grid gap-0 grid-cols-[1.05fr,0.95fr]  md:flex rounded-[42px] overflow-hidden border border-[#f5decd] bg-white shadow-[0_30px_90px_rgba(201,142,102,0.22)]'>
        <div className='bg-white px-6 sm:px-10 py-10 flex flex-col gap-8'>
          <div className='space-y-3'>
            <p className='text-xs uppercase tracking-[0.4em] text-[#d28b63]'>Chef&apos;s note</p>
            <h2 className='text-3xl font-semibold tracking-tight'>Create your account</h2>
            <p className='text-sm text-[#6d5242]'>Save favorite recipes, get pantry reminders, and keep allergies front and center.</p>
            <div className='flex flex-wrap gap-2'>
              {['Meal prep pro', 'Family style', 'Gluten-free love'].map((tag) => (
                <span key={tag} className='rounded-full border border-[#f5d1b6] px-3 py-1 text-xs text-[#b47747] bg-[#fff8f0]'>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {serverError && (
            <div className='border-2 rounded-2xl flex flex-col gap-2 p-4 border-[#f5c095] bg-[#fff7ed]'>
              <span className='flex gap-2 items-center text-[#b64d1e]'>
                <GoAlertFill className='text-xl' />
                <p className='text-lg font-semibold'>Important Message!</p>
              </span>
              <span className='text-sm text-[#7f4a26]'>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleUser} className='flex flex-col gap-4'>
            {/* Name */}
            <span className='flex flex-col gap-1'>
              <label htmlFor='name' className='font-bold text-sm'>Your name</label>
              <input
                id='name'
                value={user.name}
                onChange={(e) => handleInp('name', e.target.value)}
                type='text'
                placeholder='First and last name'
                className={`${baseInputClasses} ${errors.name && touched.name ? 'border-red-500 border-2 bg-red-50' : ''}`}
              />
              {errors.name && touched.name && (
                <span className='flex gap-2 pt-1'>
                  <p className='rounded-full text-white p-2 bg-red-500 w-4 h-4 flex items-center justify-center text-[0.7rem]'>!</p>
                  <p className='text-[0.7rem] text-red-600'>{errors.name}</p>
                </span>
              )}
            </span>

            {/* Email */}
            <span className='flex flex-col gap-1'>
              <label htmlFor='email' className='font-bold text-sm'>Email</label>
              <input
                id='email'
                value={user.email}
                onChange={(e) => handleInp('email', e.target.value)}
                type='email'
                className={`${baseInputClasses} ${errors.email && touched.email ? 'border-red-500 border-2 bg-red-50' : ''}`}
              />
              {errors.email && touched.email && (
                <span className='flex gap-2 pt-1'>
                  <p className='rounded-full text-white p-2 bg-red-500 w-4 h-4 font-bold flex items-center justify-center text-[0.7rem]'>!</p>
                  <p className='text-[0.7rem] text-red-600'>{errors.email}</p>
                </span>
              )}
            </span>

            {/* Password */}
            <span className='flex flex-col gap-1'>
              <label htmlFor='password' className='font-bold text-sm'>Password</label>
              <input
                id='password'
                value={user.password}
                onChange={(e) => handleInp('password', e.target.value)}
                type='password'
                placeholder='at least 8 characters'
                className={`${baseInputClasses} ${errors.password && touched.password ? 'border-red-500 border-2 bg-red-50' : ''}`}
              />
              {!errors.password && !touched.password && (
                <span className='flex gap-2 pt-1'>
                  <p className='rounded-full text-white p-2 bg-[#0e63be] w-4 h-4 flex font-bold items-center justify-center text-[0.7rem]'>i</p>
                  <p className='text-[0.7rem]'>Passwords must be at least 8 characters.</p>
                </span>
              )}
              {errors.password && touched.password && (
                <span className='flex gap-2 pt-1'>
                  <p className='rounded-full text-white p-2 bg-red-500 w-4 h-4 font-bold flex items-center justify-center text-[0.7rem]'>!</p>
                  <p className='text-[0.7rem] text-red-600'>{errors.password}</p>
                </span>
              )}
            </span>

            {/* Re-enter Password */}
            <span className='flex flex-col gap-1'>
              <label htmlFor='rePassword' className='font-bold text-sm'>Re-enter password</label>
              <input
                id='rePassword'
                value={user.rePassword}
                onChange={(e) => handleInp('rePassword', e.target.value)}
                type='password'
                className={`${baseInputClasses} ${errors.rePassword && touched.rePassword ? 'border-red-500 border-2 bg-red-50' : ''}`}
              />
              {errors.rePassword && touched.rePassword && (
                <span className='flex gap-2 pt-1'>
                  <p className='rounded-full text-white p-2 bg-red-500 w-4 h-4 font-bold flex items-center justify-center text-[0.7rem]'>!</p>
                  <p className='text-[0.7rem] text-red-600'>{errors.rePassword}</p>
                </span>
              )}
            </span>

            {/* Dietary type */}
            <span className='flex flex-col gap-1'>
              <label htmlFor='dietaryType' className='font-bold text-sm'>Dietary type</label>
              <select
                id='dietaryType'
                value={user.dietaryType}
                onChange={(e) => handleInp('dietaryType', e.target.value)}
                className={`${baseInputClasses} appearance-none cursor-pointer`}
              >
                <option value='none'>None</option>
                <option value='vegetarian'>Vegetarian</option>
                <option value='vegan'>Vegan</option>
                <option value='gluten_free'>Gluten Free</option>
                <option value='keto'>Keto</option>
              </select>
            </span>

            {/* Allergies */}
            <span className='flex flex-col gap-1'>
              <label htmlFor='allergies' className='font-bold text-sm'>Allergies (optional)</label>
              <input
                id='allergies'
                value={user.allergies}
                onChange={(e) => handleInp('allergies', e.target.value)}
                type='text'
                placeholder='e.g., peanuts, shellfish'
                className={`${baseInputClasses}`}
              />
            </span>

            <button
              type="submit"
              className='p-3 text-[.95rem] w-full rounded-full text-white bg-gradient-to-r from-[#f2c29a] via-[#ecab84] to-[#e3875a] cursor-pointer shadow-[0_15px_32px_rgba(202,128,85,0.35)] transition-transform duration-200 hover:-translate-y-0.5'
            >
              Create your account
            </button>

            <hr className='text-[#0000000d] w-full my-2' />

            <span className='text-sm'>
              Already have an account? <Link className='text-[#c27444] font-semibold' to='/auth/token'>Sign in ›</Link>
            </span>
          </form>
        </div>
        <AuthShowcase variant="register" />
      </div>
    </div>
  );
};

export default Register;
