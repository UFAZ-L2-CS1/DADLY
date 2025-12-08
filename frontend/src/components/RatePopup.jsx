import React, { useContext, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { FaStar } from 'react-icons/fa'
import DataContext from '../../context/DataContext'

const STAR_COUNT = 5

const RatePopup = ({ onClose, onSubmit }) => {
  const { currentUser } = useContext(DataContext)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState('idle') // idle | success | error
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const { style } = document.body
    const originalOverflow = style.overflow
    style.overflow = 'hidden'

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      style.overflow = originalOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  const headline = useMemo(() => {
    if (status === 'success') return 'Thank you!'
    return currentUser ? `Hi ${currentUser.name?.split(' ')[0] || 'there'}, rate your experience` : 'Rate your Dadly experience'
  }, [currentUser, status])

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget && !submitting) {
      onClose()
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!rating) {
      setErrorMessage('Please select a rating before submitting.')
      return
    }

    setSubmitting(true)
    setStatus('idle')
    setErrorMessage('')

    try {
      const payload = { rating, feedback: feedback.trim() }
      if (onSubmit) {
        await onSubmit(payload)
      } else {
        await new Promise((resolve) => setTimeout(resolve, 600))
      }

      setStatus('success')
      setTimeout(onClose, 900)
    } catch (err) {
      console.error('Failed to submit rating', err)
      setStatus('error')
      setErrorMessage('We could not save your rating. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const modal = (
    <div
      className='fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[120] flex items-center justify-center px-4'
      onClick={handleBackdropClick}
    >
      <div className='w-full max-w-lg bg-white rounded-3xl shadow-2xl relative overflow-hidden animate-in fade-in duration-200'>
        <button
          type='button'
          onClick={onClose}
          className='absolute top-4 right-4 text-gray-400 hover:text-[#E64C15] transition-colors'
          aria-label='Close rate form'
          disabled={submitting}
        >
          <X size={22} />
        </button>

        <form className='p-8 flex flex-col gap-6' onSubmit={handleSubmit}>
          <div>
            <p className='text-sm font-semibold uppercase tracking-[0.3rem] text-[#EB7A30] mb-2'>Rate This</p>
            <h2 className='text-2xl font-semibold text-[#151515]'>{headline}</h2>
            <p className='text-sm text-[#5c5c5c] mt-1'>Your feedback helps us craft smarter meal plans and recipes tailored for you.</p>
          </div>

          <div className='flex items-center justify-center gap-2 py-3'>
            {Array.from({ length: STAR_COUNT }).map((_, index) => {
              const value = index + 1
              const isActive = value <= (hoverRating || rating)
              return (
                <button
                  type='button'
                  key={value}
                  className='p-1'
                  onMouseEnter={() => setHoverRating(value)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(value)}
                  aria-label={`Rate ${value} ${value === 1 ? 'star' : 'stars'}`}
                >
                  <FaStar
                    size={36}
                    className={isActive ? 'text-[#E64C15]' : 'text-[#F5D3C1]'}
                  />
                </button>
              )
            })}
          </div>

          <div className='space-y-2'>
            <label htmlFor='rate-feedback' className='text-sm font-medium text-[#151515]'>Tell us what stood out (optional)</label>
            <textarea
              id='rate-feedback'
              className='w-full rounded-2xl border border-[#f0f0f0] bg-[#fffaf7] px-4 py-3 text-sm text-[#5c5c5c] focus:border-[#E64C15] focus:outline-none min-h-[120px] resize-none'
              placeholder='Share any thoughts, requests, or ideas...'
              value={feedback}
              onChange={(event) => setFeedback(event.target.value)}
              disabled={submitting}
            />
            {errorMessage && <p className='text-sm text-red-500'>{errorMessage}</p>}
            {status === 'success' && <p className='text-sm text-green-600'>Rating received! Thank you for helping us improve.</p>}
          </div>

          <div className='flex flex-col-reverse sm:flex-row gap-3'>
            <button
              type='button'
              onClick={onClose}
              className='flex-1 border border-[#f0f0f0] text-[#5c5c5c] font-medium rounded-2xl py-3 hover:bg-[#fff4ee] transition-colors'
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type='submit'
              className='flex-1 bg-[#E64C15] text-white font-semibold rounded-2xl py-3 disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_10px_20px_rgba(230,76,21,0.25)] hover:bg-[#d43f0f] transition-colors'
              disabled={submitting || rating === 0}
            >
              {submitting ? 'Sending...' : 'Send rating'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )

  const portalTarget = typeof document !== 'undefined' ? document.body : null
  if (!portalTarget) return null
  return createPortal(modal, portalTarget)
}

export default RatePopup
