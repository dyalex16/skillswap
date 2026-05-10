import { useEffect, useRef, useState } from 'react'

const useInView = (options = {}) => {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true)
        observer.disconnect() // only animate once
      }
    }, { threshold: 0.15, ...options })

    if (ref.current) observer.observe(ref.current)

    return () => observer.disconnect()
  }, [])

  return [ref, inView]
}

export default useInView