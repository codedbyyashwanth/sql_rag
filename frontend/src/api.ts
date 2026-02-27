const BASE_URL = '/api'

export interface QueryResult {
  columns: string[]
  rows: string[][]
  row_count: number
}

export interface AIResponse {
  response: string
}

export async function runQuery(query: string): Promise<QueryResult> {
  const res = await fetch(`${BASE_URL}/run-query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail ?? 'Failed to execute query')
  }

  return res.json()
}

export async function askAI(query: string): Promise<AIResponse> {
  const res = await fetch(`${BASE_URL}/ask-ai`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail ?? 'Failed to get AI response')
  }

  return res.json()
}
