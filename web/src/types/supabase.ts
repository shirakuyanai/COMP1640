export type Database = {
  storage: {
    buckets: {
      'content-files': {
        Row: {
          name: string
          created_at: string
          id: string
          last_accessed_at: string
          updated_at: string
          owner: string
        }
      }
    }
  }
} 