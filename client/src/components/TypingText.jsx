import { useState, useEffect } from 'react'

const TypingText = ({ text, speed = 20, onComplete }) => {
  const [displayed, setDisplayed] = useState('')
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayed(prev => prev + text[index])
        setIndex(prev => prev + 1)
      }, speed)
      return () => clearTimeout(timeout)
    } else {
      onComplete?.()
    }
  }, [index, text, speed])

  return (
    <span>
      {displayed}
      {index < text.length && (
        <span className="inline-block w-0.5 h-3.5 bg-indigo-400 ml-0.5 animate-pulse" />
      )}
    </span>
  )
}

export default TypingText