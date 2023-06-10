import { create } from 'zustand'

export interface AppStore {
  search: string | null
  setSearch: (q: string | null) => void
}

export const useApp = create<AppStore>((set) => ({
  search: null,
  setSearch: (q) => set({ search: q === '' ? null : q }),
}))
