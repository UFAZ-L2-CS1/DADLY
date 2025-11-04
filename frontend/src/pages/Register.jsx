import React, { useState } from 'react'
import logoDadly from '../assets/logoDadly.png'
import { Link } from 'react-router-dom'
import { signUp } from '../../service/AuthService.js';
import { useNavigate } from 'react-router-dom';
import { GoAlertFill } from "react-icons/go";
import { nanoid } from 'nanoid'
const Register = () => {
    const navigate = useNavigate()
    const [user, setUser] = useState({
        name: '',
        email: '',
        password: '',
        rePassword: '',
        watchList:[],
        rateHistory:[],
        watchHistory:[]
    });

    const [errors, setErrors] = useState({
        name: '',
        email: '',
        password: '',
        rePassword: ''
    });

    const [touched, setTouched] = useState({
        name: false,
        email: false,
        password: false,
        rePassword: false
    });
    const [error, setError] = useState(false)
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function handleInp(field, value) {
        setUser(prev => ({
            ...prev,
            [field]: value
        }));

        // Real-time validation
        let error = '';

        switch (field) {
            case 'name':
                if (value.trim().length === 0) {
                    error = 'Enter your name';
                }
                break;
            case 'email':
                if (!validateEmail(value) && value.length > 0) {
                    error = 'Enter a valid email address';
                } else if (value.length === 0) {
                    error = 'Enter your email address';
                }
                break;
            case 'password':
                if (value.length < 8 && value.length > 0) {
                    error = 'Passwords must be at least 8 characters';
                } else if (value.length === 0) {
                    error = 'Enter your password';
                }
                if (user.rePassword && user.rePassword !== value) {
                    setErrors(prev => ({
                        ...prev,
                        rePassword: 'Passwords do not match'
                    }));
                } else if (user.rePassword && user.rePassword === value) {
                    setErrors(prev => ({
                        ...prev,
                        rePassword: ''
                    }));
                }
                break;
            case 'rePassword':
                if (value !== user.password && value.length > 0) {
                    error = 'Passwords do not match';
                } else if (value.length === 0) {
                    error = 'Re-enter your password';
                }
                break;
        }

        setErrors(prev => ({
            ...prev,
            [field]: error
        }));
    }

    async function handleUser() {
        setTouched({
            name: true,
            email: true,
            password: true,
            rePassword: true
        });

        // Validate all fields
        const newErrors = {};

        if (user.name.trim().length === 0) {
            newErrors.name = 'Enter your name';
        }

        if (user.email.length === 0) {
            newErrors.email = 'Enter your email address';
        } else if (!validateEmail(user.email)) {
            newErrors.email = 'Enter a valid email address';
        }

        if (user.password.length === 0) {
            newErrors.password = 'Enter your password';
        } else if (user.password.length < 8) {
            newErrors.password = 'Passwords must be at least 8 characters';
        }

        if (user.rePassword.length === 0) {
            newErrors.rePassword = 'Type your password again';
        } else if (user.rePassword !== user.password) {
            newErrors.rePassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        if (Object.values(newErrors).some(e => e !== '')) {
            return;
        }

        const postUser = {
            ...user,
            id: nanoid(),
            role: 'user',
            createdAt: new Date().toISOString(),
            isActive: true,
            lastLogin: null
        };

        try {
            const newUser = await signUp(postUser);

            if (newUser) {
                navigate('/ap/signin');
                console.log('Uğurla qeydiyyatdan keçdiniz!');
            }
        } catch (error) {
            if (error.message === "Bu e-poçt ünvanında hesab artıq mövcuddur") {
                console.error(error.message);
                setError(true)
            } else {
                console.error("Qeydiyyat zamanı xəta baş verdi!", error.message);
            }
        }
    };

    return (
        <div className='flex flex-col items-center justify-center gap-5 py-5 px-[0.75rem] min-h-[90vh]'>

            <Link to='/'>  <img src={logoDadly} className='w-30' alt="IMDb Logo" /></Link>
            {error && <div className='border-2 border-l-10 rounded-lg flex flex-col gap-2 p-4 md:w-90 border-[#ffb14a]'>
                <span className='flex gap-2 items-center'>
                    <GoAlertFill className='text-xl text-[#ffb14a] ' />
                    <p className='text-xl font-semibold'>Important Massage!</p></span>
                <span>
                    You indicated you're a new customer, but an account already exists with the email address
                    <p className='font-bold'>{user.email}</p>
                </span>
            </div>}
            <div className='rounded-md p-4 border-1 border-[#00000027] md:w-90 flex flex-col gap-3'>
                <h2 className='text-3xl tracking-wide'>Create account</h2>
                <div className='flex flex-col gap-3'>
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

                    <button
                        onClick={handleUser}
                        className='p-2 text-[.875rem] w-full rounded-full text-white bg-[#EB7A30] cursor-pointer'
                    >
                        Create your IMDb account
                    </button>

                    <hr className='text-[#00000037] w-full my-3' />

                    <span className='text-sm'>
                        Already have an account? <Link className='text-[#0e63be]' to='/token'>Sign in ›</Link>
                    </span>
                </div>
            </div>
            <hr className='text-[#00000037] w-full' />
            <div className="mt-8 text-sm text-gray-500 text-center space-x-4">
                <a href="#" className="text-[#0e63be] hover:underline">Help</a>
                <a href="#" className="text-[#0e63be] hover:underline">Conditions of Use</a>
                <a href="#" className="text-[#0e63be] hover:underline">Privacy Notice</a>
                <p className="mt-2">© 2025</p>
            </div>
        </div>
    )
}

export default Register
