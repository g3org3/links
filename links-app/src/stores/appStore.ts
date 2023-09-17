import { Record } from 'pocketbase'
import { create } from 'zustand'

export interface AppStore {
  search: string | null
  setSearch: (q: string | null) => void
  links: Record[]
  nextPage: Record[]
  addLinks: (l: Record[]) => void
  addPage: () => void
  init: boolean
}

export const useApp = create<AppStore>((set) => ({
  search: null,
  init: true,
  setSearch: (q) => set({ search: q === '' ? null : q }),
  addLinks: (nextlinks) => {
    set(s => ({
      init: false,
      links: s.init ? nextlinks.slice(0, 16) : s.links,
      nextPage: s.init ? nextlinks.slice(16) : nextlinks
    }))
  },
  addPage: () => {
    set(s => ({
      links: s.init ? [] : s.links.concat(s.nextPage),
      nextPage: s.init ? [] : s.nextPage,
    }))
  },
  links: [],
  nextPage: [],
}))
