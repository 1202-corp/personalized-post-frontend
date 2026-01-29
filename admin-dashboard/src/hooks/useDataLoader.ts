import { useState, useCallback } from 'react'

/**
 * Custom hook for loading data with loading state and error handling.
 * 
 * @template T - Type of data to load
 * @returns Object with data, loading state, error, and load function
 */
export function useDataLoader<T>() {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const load = useCallback(async (loader: () => Promise<T>) => {
    try {
      setLoading(true)
      setError(null)
      const result = await loader()
      setData(result)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
      console.error('Error loading data:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  return { data, loading, error, load }
}
