import React, { useState } from 'react';
import logoDadly from '../assets/logoDadly.png';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../../service/AuthService.js';
import { GoAlertFill } from "react-icons/go";

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
      navigate('/ap/signin');
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
    <div className='flex flex-col items-center justify-center gap-5 py-5 px-[0.75rem] min-h-[90vh]'>
      <Link to='/'>
        <img src={logoDadly} className='w-30' alt="DADLY Logo" />
      </Link>

      {serverError && (
        <div className='border-2 rounded-lg flex flex-col gap-2 p-4 md:w-90 border-[#ffb14a]'>
          <span className='flex gap-2 items-center'>
            <GoAlertFill className='text-xl text-[#ffb14a]' />
            <p className='text-xl font-semibold'>Important Message!</p>
          </span>
          <span>{serverError}</span>
        </div>
      )}

      <div className='rounded-md p-4 border-1 border-[#00000027] md:w-90 flex flex-col gap-3'>
        <h2 className='text-3xl tracking-wide'>Create account</h2>

        <form onSubmit={handleUser} className='flex flex-col gap-3'>
          {/* Name */}
          <span className='flex flex-col gap-1'>
            <label htmlFor='name' className='font-bold text-sm'>Your name</label>
            <input
              id='name'
              value={user.name}
              onChange={(e) => handleInp('name', e.target.value)}
              type='text'
              placeholder='First and last name'
              className={`px-2 py-1 rounded-md ${errors.name && touched.name ? 'border-red-500 border-2' : 'border-1'}`}
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
              className={`px-2 py-1 rounded-md ${errors.email && touched.email ? 'border-red-500 border-2' : 'border-1'}`}
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
              className={`px-2 py-1 rounded-md ${errors.password && touched.password ? 'border-red-500 border-2' : 'border-1'}`}
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
              className={`px-2 py-1 rounded-md ${errors.rePassword && touched.rePassword ? 'border-red-500 border-2' : 'border-1'}`}
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
              className='px-2 py-1 rounded-md border border-gray-300'
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
              className='px-2 py-1 rounded-md border border-gray-300'
            />
          </span>

          <button
            type="submit"
            className='p-2 text-[.875rem] w-full rounded-full text-white bg-[#EB7A30] cursor-pointer'
          >
            Create your account
          </button>

          <hr className='text-[#00000037] w-full my-3' />

          <span className='text-sm'>
            Already have an account? <Link className='text-[#0e63be]' to='/ap/signin'>Sign in ›</Link>
          </span>
        </form>
      </div>
    </div>
  );
};

export default Register;
