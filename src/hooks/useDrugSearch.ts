import { useState, useRef, useEffect, useCallback } from 'react'
import { gqlFetch } from '../lib/graphql'
import { SEARCH_DRUGS_QUERY } from '../lib/queries'
import type { Drug } from '../types'

/**
 * Debounced server-side drug search, shared by the inline navbar dropdown and
 * the ⌘K command palette. Owns the query text, the GraphQL request, and the
 * 300ms debounce — the surrounding cmdk surfaces only render what it returns.
 */
export function useDrugSearch() {
  const [query, setQuery] = useState('')
  const [drugResults, setDrugResults] = useState<Drug[]>([])
  const [searching, setSearching] = useState(false)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const searchDrugs = useCallback(async (q: string) => {
    setSearching(true)
    try {
      const data = await gqlFetch<{ searchDrugs: Drug[] }>(SEARCH_DRUGS_QUERY, {
        query: q
      })
      setDrugResults(data.searchDrugs)
    } catch {
      setDrugResults([])
    } finally {
      setSearching(false)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (query.length < 2) {
      setDrugResults([])
      return
    }
    debounceRef.current = setTimeout(() => searchDrugs(query), 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, searchDrugs])

  function reset() {
    setQuery('')
    setDrugResults([])
  }

  return { query, setQuery, drugResults, searching, reset }
}
