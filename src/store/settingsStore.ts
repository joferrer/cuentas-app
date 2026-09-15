import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULT_GRAMS_PER_LB } from '../lib/units'

interface SettingsState {
  /** grams in one libra: 500 = convención comercial colombiana, 453.592 = libra imperial */
  gramsPerLb: number
  setGramsPerLb: (value: number) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      gramsPerLb: DEFAULT_GRAMS_PER_LB,
      setGramsPerLb: (value) => set({ gramsPerLb: value }),
    }),
    { name: 'cuentas-claras-settings' },
  ),
)
