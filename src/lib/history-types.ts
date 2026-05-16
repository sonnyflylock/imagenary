/**
 * Shared type for persisted tool results that show up in the history strip.
 * Server-persisted items have an id; mid-generation pending items don't.
 */
export interface HistoryItem {
  id: string | null
  input_url: string
  output_url: string
  prompt?: string | null
  created_at?: string
}
