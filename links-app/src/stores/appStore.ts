import { create } from 'zustand'

import { LinksResponse } from 'utils/pbtypes'

export interface AppStore {
  search: string | null
  setSearch: (q: string | null) => void
  links: LinksResponse[]
  nextPage: LinksResponse[]
  addLinks: (l: LinksResponse[], isDiff?: boolean) => void
  addPage: () => void
  reset: () => void
  init: boolean
}

export const useApp = create<AppStore>((set) => ({
  search: null,
  init: true,
  setSearch: (q) => set({ search: q === '' ? null : q }),
  addLinks: (nextlinks, isDiff) => {
    set((s) => {
      if (s.init) {
        return {
          init: false,
          links: nextlinks.slice(0, 16),
          nextPage: nextlinks.slice(16),
        }
      }

      return {
        init: false,
        links: s.links,
        nextPage: nextlinks,
      }
    })
  },
  addPage: () => {
    set((s) => {
      if (s.init) {
        return { links: [], nextPage: [] }
      }

      return {
        links: s.links.concat(s.nextPage),
        nextPage: s.nextPage,
      }
    })
  },
  reset: () => {
    set(() => {
      return {
        init: true,
      }
    })
  },
  links: [],
  nextPage: [],
}))
