import { useState, useEffect } from 'react'

export const usePerformance = () => {
  const [renderCount, setRenderCount] = useState(0)

  useEffect(() => {
    setRenderCount(prev => prev + 1)
  }, [])

  return {
    performance: {
      renderCount
    }
  }
}
