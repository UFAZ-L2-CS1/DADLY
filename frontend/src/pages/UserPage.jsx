import React from 'react'
import UserList from '../src/Components/UserList'
import UserMore from '../src/Components/UserMore'
import { useParams } from 'react-router-dom'
import { dataCntxt } from '../context/DataContext'
import { useContext } from 'react'
const UserPage = () => {
    const { listType } = useParams()
    const { currentUser } = useContext(dataCntxt)
    return (
        <div>
            <div className='bg-[#121212]'>
            <div className='py-10 text-white max-w-[1280px] mx-auto'>
                {listType === 'watchList' &&
                    <div className='flex flex-col gap-2'>
                        <h2 className='text-[3rem]'>Your WatchList</h2>
                        <p className='italic'>by {currentUser?.name}</p>
                        <p>Your Watchlist is the place to track the titles you want to watch. You can sort your Watchlist by the IMDb rating or popularity score and arrange your titles in the order you want to see them.</p>
                    </div>}
                {listType === 'watchHistory' &&
                    <div className='flex flex-col gap-2'>
                        <h2 className='text-[3rem]'>
                            Your watch history</h2>
                        <p className='italic'>by {currentUser?.name}</p>
                        <p>Everything you've marked as watched, rated, reviewed, or checked into.</p>
                    </div>}
                {listType === 'rateHistory' &&
                    <div className='flex flex-col gap-2'>
                        <h2 className='text-[3rem]'>Your ratings</h2>
                        <p className='italic'>by {currentUser?.name}</p>
                        <p> This page compiles a list of titles you have rated, providing a convenient overview of all your ratings.</p>
                    </div>}
            </div>
            </div>
            <div className='bg-white'>
                <div className='flex flex-col gap-10 py-15 max-w-[1280px] px-[1.5rem] mx-auto '>
                    <div className='flex justify-between w-full'>
                        <UserList />
                        <UserMore />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UserPage