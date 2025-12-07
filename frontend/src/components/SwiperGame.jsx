"use client"

import * as motion from "motion/react-client"
import { useState } from "react"

const MotionDiv = motion.div

const MEAL_CARDS = [
  {
    id: 1,
    title: "Smoky Shakshuka",
    image:
      "https://images.unsplash.com/photo-1473093226795-af9932fe5856?auto=format&fit=crop&w=900&q=80",
    meta: "30 min · Medium",
  },
  {
    id: 2,
    title: "Charred Steak Salad",
    image:
      "https://images.unsplash.com/photo-1478145046317-39f10e56b5e9?auto=format&fit=crop&w=900&q=80",
    meta: "25 min · Easy",
  },
  {
    id: 3,
    title: "Berry Ricotta Toast",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80",
    meta: "10 min · Easy",
  },
  {
    id: 4,
    title: "Herb Butter Salmon",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80",
    meta: "35 min · Medium",
  },
  {
    id: 5,
    title: "Miso Veggie Bowl",
    image:
      "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=900&q=80",
    meta: "40 min · Hard",
  },
]

export default function SwiperGame() {
  const [cards, setCards] = useState(MEAL_CARDS)
  const [winner, setWinner] = useState(null)

  const handleDragEnd = (info, side, id) => {
    if (
      (side === "left" && info.offset.x <= -20) ||
      (side === "right" && info.offset.x >= 20)
    ) {
      setCards((prev) => {
        const newCards = prev.filter((card) => card.id !== id)
        if (newCards.length === 1) setWinner(newCards[0])
        return newCards
      })
    }
  }

  const renderCardContent = (card) => (
    <div style={cardContent}>
      <img src={card.image} alt={card.title} style={cardImage} loading="lazy" />
      <div style={cardOverlay} />
      <div style={cardInfo}>
        <p style={cardMeta}>{card.meta}</p>
        <h3 style={cardTitle}>{card.title}</h3>
      </div>
    </div>
  )

  const renderCards = () => {
    if (cards.length === 1 && winner) {
      return (
        <MotionDiv
          key={`winner-${winner.id}`}
          style={{
            ...box,
            position: "absolute",
            left: "50%",
            top: "50%",
            x: "-50%",
            y: "-50%",
            cursor: "default",
          }}
          animate={{ scale: 1.2 }}
          transition={{ duration: 0.6 }}
        >
          {renderCardContent(winner)}
          <div style={winnerBadge}>Chef's Choice</div>
        </MotionDiv>
      )
    }

    const result = []
    for (let i = 0; i < cards.length; i += 2) {
      const leftCard = cards[i]
      const rightCard = cards[i + 1]

      if (leftCard) {
        result.push(
          <MotionDiv
            key={leftCard.id}
            drag="x"
            dragConstraints={{ left: -50, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, info) => handleDragEnd(info, "left", leftCard.id)}
            style={{ ...box, left: 80, position: "absolute", rotate: -12 }}
            whileTap={{ cursor: "grabbing" }}
          >
            {renderCardContent(leftCard)}
          </MotionDiv>
        )
      }

      if (rightCard) {
        result.push(
          <MotionDiv
            key={rightCard.id}
            drag="x"
            dragConstraints={{ left: 0, right: 50 }}
            dragElastic={0.2}
            onDragEnd={(e, info) => handleDragEnd(info, "right", rightCard.id)}
            style={{ ...box, right: 80, position: "absolute", rotate: 12 }}
            whileTap={{ cursor: "grabbing" }}
          >
            {renderCardContent(rightCard)}
          </MotionDiv>
        )
      }
    }
    return result
  }

  return <div style={constraints}>{renderCards()}</div>
}

const constraints = {
  width: 820,
  height: 520,
  backgroundColor: "rgba(255, 255, 255, 0.05)",
  borderRadius: 20,
  position: "relative",
  overflow: "hidden",
  margin: "50px auto",
  border: "1px solid rgba(255,255,255,0.1)",
  boxShadow: "0 25px 60px rgba(0,0,0,0.15)",
}

const box = {
  width: 320,
  height: 400,
  top: 60,
  borderRadius: 24,
  cursor: "grab",
  overflow: "hidden",
  boxShadow: "0 20px 45px rgba(0,0,0,0.25)",
}

const cardContent = {
  width: "100%",
  height: "100%",
  position: "relative",
}

const cardImage = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
}

const cardOverlay = {
  position: "absolute",
  inset: 0,
  background:
    "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.65) 100%)",
}

const cardInfo = {
  position: "absolute",
  left: 20,
  right: 20,
  bottom: 20,
  color: "#fff",
}

const cardMeta = {
  fontSize: 14,
  letterSpacing: 1,
  textTransform: "uppercase",
  opacity: 0.85,
}

const cardTitle = {
  marginTop: 6,
  fontSize: 24,
  fontWeight: 600,
}

const winnerBadge = {
  position: "absolute",
  top: 16,
  right: 16,
  padding: "8px 14px",
  borderRadius: 999,
  backgroundColor: "#EB7A30",
  color: "#fff",
  fontWeight: 600,
  fontSize: 14,
  textTransform: "uppercase",
  letterSpacing: 1,
}
