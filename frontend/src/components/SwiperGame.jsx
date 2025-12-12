"use client"

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import * as motion from 'motion/react-client'
import { useNavigate } from 'react-router-dom'
import { fetchRecipeFeed } from '../../service/Data'

const MotionDiv = motion.div

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80'

const formatMeta = (recipe) => {
  const prep = recipe.prep_time ? `${recipe.prep_time} min` : 'Prep ?'
  const difficulty = recipe.difficulty
    ? recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1)
    : 'Difficulty ?'
  return `${prep} · ${difficulty}`
}

const shuffleCards = (items) => {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export default function SwiperGame({ limit = 10 }) {
  const navigate = useNavigate()
  const [cards, setCards] = useState([])
  const [deck, setDeck] = useState([])
  const [winner, setWinner] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [status, setStatus] = useState('Loading contenders...')
  const [swipeCount, setSwipeCount] = useState(0)
  const [fireworks, setFireworks] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const loadDeck = useCallback(async () => {
    setLoading(true)
    setError(null)
    setWinner(null)
    setStatus('Summoning the tastiest challengers...')
    setSwipeCount(0)
    try {
      const response = await fetchRecipeFeed(limit)
      const hydrated = (Array.isArray(response) ? response : [])
        .filter((recipe) => recipe?.id)
        .slice(0, limit)
        .map((recipe) => ({
          id: recipe.id,
          title: recipe.name || 'Mystery Dish',
          image: recipe.image_url || FALLBACK_IMAGE,
          meta: formatMeta(recipe),
        }))

      if (!hydrated.length) {
        setCards([])
        setDeck([])
        setStatus('No dishes available to battle right now.')
        return
      }

      const randomized = shuffleCards(hydrated)
      setDeck(hydrated)
      setCards(randomized)
      setStatus('Drag a card left or right to knock it out.')
    } catch (err) {
      console.error('Failed to load swiper game recipes:', err)
      setError('We could not load the arena. Please try again.')
      setCards([])
      setDeck([])
    } finally {
      setLoading(false)
    }
  }, [limit])

  useEffect(() => {
    loadDeck()
  }, [loadDeck])

  useEffect(() => {
    if (!winner) return undefined
    setFireworks(true)
    const timer = setTimeout(() => setFireworks(false), 2200)
    return () => clearTimeout(timer)
  }, [winner])

  const handleDragEnd = (info, side, id) => {
    const passedThreshold =
      (side === 'left' && info.offset.x <= -20) || (side === 'right' && info.offset.x >= 20)
    if (!passedThreshold) return

    setCards((previous) => {
      const filtered = previous.filter((card) => card.id !== id)
      const deckSize = deck.length || previous.length
      const remaining = filtered.length
      setSwipeCount(deckSize - remaining)

      if (remaining === 1) {
        setWinner(filtered[0])
        setStatus(`Winner: ${filtered[0].title}!`)
      } else if (remaining === 0) {
        setWinner(null)
        setStatus('All dishes served! Reset to play again.')
      } else {
        setStatus(`${remaining} dishes remain... keep swiping!`)
      }

      return filtered
    })
  }

  const handleReset = () => {
    if (!deck.length) return
    const reshuffled = shuffleCards(deck)
    setCards(reshuffled)
    setWinner(null)
    setSwipeCount(0)
    setStatus('Fresh round! Drag to eliminate each dish.')
  }

  const progress = useMemo(() => {
    if (!deck.length) return 0
    return Math.round(((deck.length - cards.length) / deck.length) * 100)
  }, [cards.length, deck.length])

  const renderCardContent = (card) => (
    <div style={cardContent}>
      <img src={card.image} alt={card.title} style={cardImage} loading='lazy' />
      <div style={cardOverlay} />
      <div style={cardInfo}>
        <p style={cardMeta}>{card.meta}</p>
        <h3 style={cardTitle}>{card.title}</h3>
      </div>
    </div>
  )

  const handleWinnerNavigation = useCallback(() => {
    if (!winner?.id) return
    navigate(`/recipes/${winner.id}`)
  }, [navigate, winner])

  const renderCards = () => {
    if (cards.length === 1 && winner) {
      return (
        <MotionDiv
          key={`winner-${winner.id}`}
          style={{
            ...box,
            ...(isMobile && mobileBox),
            position: 'absolute',
            left: '50%',
            top: '50%',
            x: '-50%',
            y: '-50%',
            cursor: 'pointer',
          }}
          animate={{ scale: 1.15 }}
          transition={{ duration: 0.6 }}
          role='button'
          tabIndex={0}
          onClick={handleWinnerNavigation}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              handleWinnerNavigation()
            }
          }}
        >
          {renderCardContent(winner)}
          <div style={winnerBadge}>Chef&apos;s Choice</div>
        </MotionDiv>
      )
    }

    const pairs = []
    for (let i = 0; i < cards.length; i += 2) {
      const leftCard = cards[i]
      const rightCard = cards[i + 1]

      if (leftCard) {
        pairs.push(
          <MotionDiv
            key={leftCard.id}
            drag='x'
            dragConstraints={{ left: -80, right: 0 }}
            dragElastic={0.25}
            onDragEnd={(e, info) => handleDragEnd(info, 'left', leftCard.id)}
            style={{
              ...box,
              ...(isMobile && mobileBox),
              position: 'absolute',
              ...(isMobile
                ? { left: '50%', top: 40, x: '-50%', rotate: -6 }
                : { left: 80, top: 60, rotate: -12 }),
            }}
            whileTap={{ cursor: 'grabbing' }}
          >
            {renderCardContent(leftCard)}
          </MotionDiv>
        )
      }

      if (rightCard) {
        pairs.push(
          <MotionDiv
            key={rightCard.id}
            drag='x'
            dragConstraints={{ left: 0, right: 80 }}
            dragElastic={0.25}
            onDragEnd={(e, info) => handleDragEnd(info, 'right', rightCard.id)}
            style={{
              ...box,
              ...(isMobile && mobileBox),
              position: 'absolute',
              ...(isMobile
                ? { left: '50%', bottom: 40, x: '-50%', rotate: 6 }
                : { right: 80, top: 60, rotate: 12 }),
            }}
            whileTap={{ cursor: 'grabbing' }}
          >
            {renderCardContent(rightCard)}
          </MotionDiv>
        )
      }
    }

    return pairs
  }

  const renderLoading = () => (
    <div style={loadingStage}>
      <MotionDiv
        style={loadingSpinner}
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
      />
      <p style={helperText}>Matching taste buds...</p>
    </div>
  )

  const renderError = () => (
    <div style={loadingStage}>
      <p style={errorText}>{error}</p>
      <button style={primaryButton} type='button' onClick={loadDeck}>
        Try again
      </button>
    </div>
  )

  const roundSize = deck.length || limit

  return (
    <div style={shell}>
      <div style={glowOne} />
      <div style={glowTwo} />
      <div style={wrapper}>
        <div style={hud}>
          <p style={statusText}>
            
            {status}
          </p>
          <div style={deckBadge}>Round of {roundSize} dishes</div>
          <div style={scoreboard}>
            <div style={scoreItem}>
              <span style={scoreLabel}>Remaining</span>
              <strong style={scoreValue}>{cards.length}</strong>
            </div>
            <div style={scoreItem}>
              <span style={scoreLabel}>Eliminated</span>
              <strong style={scoreValue}>{swipeCount}</strong>
            </div>
            <div style={scoreItem}>
              <span style={scoreLabel}>Progress</span>
              <strong style={scoreValue}>{progress}%</strong>
            </div>
          </div>
          <div style={progressTrack}>
            <div style={{ ...progressBar, width: `${progress}%` }} />
          </div>
          <div style={buttonRow}>
            <button
              type='button'
              style={{ ...ghostButton, opacity: deck.length ? 1 : 0.5 }}
              onClick={handleReset}
              disabled={!deck.length}
            >
              Reset round
            </button>
            <button
              type='button'
              style={{ ...primaryButton, opacity: loading ? 0.7 : 1 }}
              onClick={loadDeck}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'New challengers'}
            </button>
          </div>
          <div style={instructionRow}>
            <span  className='md:hidden' style={instructionChip}>Swipe left → skip upper dish</span>
            <span className='md:hidden' style={instructionChip}>Swipe right → skip lower dish</span>
            <span style={instructionChip}>Last card standing wins</span>
          </div>
        </div>

        <div style={isMobile ? gameStageResponsive : gameStage}>
          {loading && renderLoading()}
          {!loading && error && renderError()}
          {!loading && !error && cards.length > 0 && (
            <>
              {renderCards()}
              {winner && fireworks && (
                <MotionDiv
                  style={sparkles}
                  animate={{ scale: [1, 1.2, 1], opacity: [1, 0.6, 1] }}
                  transition={{ repeat: Infinity, duration: 1.2 }}
                >
                  ✨ 🎉 ✨
                </MotionDiv>
              )}
            </>
          )}
          {!loading && !error && !cards.length && deck.length === 0 && (
            <p style={helperText}>No dishes available. Try loading a new batch.</p>
          )}
        </div>
      </div>
    </div>
  )
}

const shell = {
  position: 'relative',
  width: '100%',
  padding: '60px 0',
  borderRadius: 48,
  marginTop:40,
  background: 'radial-gradient(circle at top, rgba(255,210,175,0.55), rgba(255,248,239,0.95))',
  overflow: 'hidden',
  border: '1px solid rgba(255,255,255,0.2)',
  boxShadow: '0 35px 120px rgba(235,160,105,0.35)',
}

const glowOne = {
  position: 'absolute',
  top: -120,
  left: '8%',
  width: 260,
  height: 260,
  background: 'rgba(255,200,161,0.7)',
  filter: 'blur(130px)',
  borderRadius: '50%',
}

const glowTwo = {
  position: 'absolute',
  bottom: -110,
  right: '6%',
  width: 300,
  height: 300,
  background: 'rgba(255,183,205,0.55)',
  filter: 'blur(150px)',
  borderRadius: '50%',
}

const wrapper = {
  width: '100%',
  maxWidth: 1040,
  margin: '0 auto',
  padding: '40px 28px 60px',
  position: 'relative',
  zIndex: 2,
  borderRadius: 40,
  background: 'rgba(255,255,255,0.8)',
  backdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.4)',
  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.25)',
}

const hud = {
  textAlign: 'center',
  marginBottom: 32,
  color: '#8a502d',
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
}

const statusText = {
  fontSize: 18,
  fontWeight: 600,
  letterSpacing: 0.5,
}

const deckBadge = {
  alignSelf: 'center',
  padding: '6px 18px',
  borderRadius: 999,
  background: 'rgba(255,215,188,0.9)',
  color: '#9a562b',
  fontSize: 12,
  letterSpacing: 3,
  textTransform: 'uppercase',
}

const scoreboard = {
  display: 'flex',
  justifyContent: 'center',
  gap: 20,
  flexWrap: 'wrap',
}

const scoreItem = {
  background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,236,226,0.9))',
  padding: '14px 22px',
  borderRadius: 18,
  minWidth: 140,
  border: '1px solid rgba(255,196,161,0.45)',
  boxShadow: '0 12px 28px rgba(235,160,105,0.25)',
}

const scoreLabel = {
  display: 'block',
  fontSize: 12,
  textTransform: 'uppercase',
  letterSpacing: 3,
  opacity: 0.7,
}

const scoreValue = {
  fontSize: 26,
  fontWeight: 700,
  marginTop: 6,
}

const progressTrack = {
  width: '100%',
  maxWidth: 480,
  height: 10,
  background: 'rgba(255,210,185,0.5)',
  borderRadius: 999,
  margin: '0 auto',
  overflow: 'hidden',
  border: '1px solid rgba(255,196,161,0.4)',
}

const progressBar = {
  height: '100%',
  borderRadius: 999,
  background: 'linear-gradient(90deg, #ffcea8, #f49b6b, #EB7A30)',
  transition: 'width 0.35s ease',
  boxShadow: '0 6px 20px rgba(235,122,48,0.35)',
}

const buttonRow = {
  display: 'flex',
  justifyContent: 'center',
  gap: 14,
  marginTop: 12,
}

const instructionRow = {
  display: 'flex',
  justifyContent: 'center',
  flexWrap: 'wrap',
  gap: 10,
  marginTop: 18,
}

const instructionChip = {
  fontSize: 12,
  letterSpacing: 1,
  textTransform: 'uppercase',
  padding: '6px 14px',
  borderRadius: 999,
  border: '1px solid rgba(255,184,147,0.6)',
  color: '#a35a2f',
  background: 'rgba(255,238,229,0.9)',
}

const primaryButton = {
  padding: '10px 22px',
  borderRadius: 999,
  border: 'none',
  background: 'linear-gradient(120deg, #ffb48d, #EB7A30)',
  color: '#2d1306',
  fontWeight: 700,
  cursor: 'pointer',
  boxShadow: '0 15px 30px rgba(235,122,48,0.2)',
}

const ghostButton = {
  padding: '10px 20px',
  borderRadius: 999,
  border: '1px solid rgba(237,147,92,0.5)',
  background: 'transparent',
  color: '#a35a2f',
  fontWeight: 600,
  cursor: 'pointer',
}

const gameStage = {
  width: 860,
  maxWidth: '100%',
  height: 540,
  background: 'linear-gradient(135deg, rgba(255,250,244,0.95), rgba(255,224,204,0.9))',
  borderRadius: 32,
  position: 'relative',
  overflow: 'hidden',
  margin: '0 auto',
  border: '1px solid rgba(255,196,161,0.4)',
  boxShadow: '0 30px 90px rgba(237,168,116,0.35)',
  backdropFilter: 'blur(6px)',
}

const gameStageResponsive = {
  width: '100%',
  maxWidth: '100%',
  height: 700,
  background: 'linear-gradient(135deg, rgba(255,250,244,0.95), rgba(255,224,204,0.9))',
  borderRadius: 32,
  position: 'relative',
  overflow: 'hidden',
  margin: '0 auto',
  border: '1px solid rgba(255,196,161,0.4)',
  boxShadow: '0 30px 90px rgba(237,168,116,0.35)',
  backdropFilter: 'blur(6px)',
}

const box = {
  width: 320,
  height: 420,
  borderRadius: 30,
  cursor: 'grab',
  overflow: 'hidden',
  boxShadow: '0 30px 65px rgba(237,168,116,0.35)',
  border: '1px solid rgba(255,196,161,0.45)',
  background: 'linear-gradient(135deg, rgba(255,255,255,0.75), rgba(255,229,209,0.8))',
}

const mobileBox = {
  width: 280,
  height: 320,
}

const cardContent = {
  width: '100%',
  height: '100%',
  position: 'relative',
}

const cardImage = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
}

const cardOverlay = {
  position: 'absolute',
  inset: 0,
  background: 'linear-gradient(180deg, rgba(255,255,255,0) 40%, rgba(0,0,0,0.6) 100%)',
}

const cardInfo = {
  position: 'absolute',
  left: 20,
  right: 20,
  bottom: 22,
  color: '#fff',
}

const cardMeta = {
  fontSize: 12,
  letterSpacing: 2,
  textTransform: 'uppercase',
  opacity: 0.9,
}

const cardTitle = {
  marginTop: 6,
  fontSize: 24,
  fontWeight: 600,
}

const winnerBadge = {
  position: 'absolute',
  top: 18,
  right: 18,
  padding: '6px 14px',
  borderRadius: 999,
  background: 'linear-gradient(120deg, #ffe0b7, #EB7A30)',
  color: '#2f1307',
  fontSize: 12,
  textTransform: 'uppercase',
  letterSpacing: 1,
}

const loadingStage = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
  gap: 16,
  color: '#9a562b',
}

const loadingSpinner = {
  width: 64,
  height: 64,
  borderRadius: '50%',
  border: '4px solid rgba(255,196,161,0.4)',
  borderTopColor: '#EB7A30',
}

const helperText = {
  fontSize: 14,
  opacity: 0.8,
}

const errorText = {
  fontSize: 16,
  fontWeight: 600,
  color: '#d55a2a',
}

const sparkles = {
  position: 'absolute',
  left: '50%',
  top: '20%',
  transform: 'translateX(-50%)',
  fontSize: 40,
  pointerEvents: 'none',
}
