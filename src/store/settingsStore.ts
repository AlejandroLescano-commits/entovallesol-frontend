import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark' | 'system'
type Lang = 'es' | 'en'

interface SettingsState {
  theme: Theme
  lang: Lang
  empresa: string
  version: string
  sistema: string
  setTheme: (t: Theme) => void
  setLang: (l: Lang) => void
  setEmpresa: (v: string) => void
  setVersion: (v: string) => void
  setSistema: (v: string) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'system',
      lang: 'es',
      empresa: 'ValleSol S.A.C.',
      version: '1.0.0',
      sistema: 'Producción Entomológica',
      setTheme: (theme) => set({ theme }),
      setLang: (lang) => set({ lang }),
      setEmpresa: (empresa) => set({ empresa }),
      setVersion: (version) => set({ version }),
      setSistema: (sistema) => set({ sistema }),
    }),
    { name: 'vs_settings' }
  )
)
