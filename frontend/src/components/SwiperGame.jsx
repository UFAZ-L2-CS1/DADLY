"use client"

import * as motion from "motion/react-client"
import { useState, useEffect } from "react"

export default function SwiperGame() {
  const [cards, setCards] = useState([
    { id: 1, color: "#ff0088" },
    { id: 2, color: "#0088ff" },
    { id: 3, color: "#00ff88" },
    { id: 4, color: "#ffaa00" },
    { id: 5, color: "#aa00ff" },
  ])

  const [winner, setWinner] = useState(null)

  const handleDragEnd = (info, side, id) => {
    if (
      (side === "left" && info.offset.x <= -20) ||
      (side === "right" && info.offset.x >= 20)
    ) {
      setCards(prev => {
        const newCards = prev.filter(card => card.id !== id)
        // If only 1 card remains, mark it as winner
        if (newCards.length === 1) setWinner(newCards[0])
        return newCards
      })
    }
  }

  const renderCards = () => {
    const result = []
    for (let i = 0; i < cards.length; i += 2) {
      const leftCard = cards[i]
      const rightCard = cards[i + 1]

      // If this is the last card, make it stable and bigger
      if (cards.length === 1 && winner) {
        return (
          <motion.div
            key={winner.id}
            style={{
              ...box,
              backgroundColor: winner.color,
              position: "absolute",
              left: "50%",
              top: "50%",
              x: "-50%",
              y: "-50%",
            }}
            animate={{ scale: 1.5 }}
            transition={{ duration: 0.8 }}
          />
        )
      }

      if (leftCard) {
        result.push(
          <motion.div
            key={leftCard.id}
            drag="x"
            dragConstraints={{ left: -50, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, info) => handleDragEnd(info, "left", leftCard.id)}
            style={{ ...box, backgroundColor: leftCard.color, left: 100, position: "absolute",rotate:-15}}
            whileTap={{ cursor: "grabbing" }}
          />
        )
      }

      if (rightCard) {
        result.push(
          <motion.div
            key={rightCard.id}
            drag="x"
            dragConstraints={{ left: 0, right: 50 }}
            dragElastic={0.2}
            onDragEnd={(e, info) => handleDragEnd(info, "right", rightCard.id)}
            style={{ ...box, backgroundColor: rightCard.color, right: 100, position: "absolute",rotate:15 }}
            whileTap={{ cursor: "grabbing" }}
          />
        )
      }
    }
    return result
  }

  return <div style={constraints}>{renderCards()}</div>
}


const constraints = {
  width: 800,
  height: 500,
  backgroundColor: "var(--hue-1-transparent)",
  borderRadius: 10,
  position: "relative",
  overflow: "hidden",
  margin: "50px auto",
}

const box = {
  width: 300,
  height: 300,
  top:50,
  borderRadius: 10,
  cursor: "grab",
}
