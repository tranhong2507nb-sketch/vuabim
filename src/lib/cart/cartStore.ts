'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { CartItem } from './types'

interface CartState {
  items: CartItem[]
  // Quà đổi đi kèm đơn (source='checkout' — dùng địa chỉ đơn)
  selectedGiftId: string | null
  // Hydration flag: true sau khi load xong từ localStorage (tránh mismatch SSR)
  hydrated: boolean
  setHydrated: () => void

  // Actions
  addItem: (
    item: Omit<CartItem, 'qty' | 'added_at'>,
    qty?: number
  ) => void
  removeItem: (product_id: string) => void
  updateQty: (product_id: string, qty: number) => void
  setSelectedGift: (giftId: string | null) => void
  clear: () => void

  // Selectors (gọi trong component)
  getItemCount: () => number
  getSubtotal: () => number
  getRawPointsToEarn: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      selectedGiftId: null,
      hydrated: false,
      setHydrated: () => set({ hydrated: true }),

      addItem: (newItem, qty = 1) => {
        const items = get().items
        const existing = items.find(i => i.product_id === newItem.product_id)

        if (existing) {
          set({
            items: items.map(i =>
              i.product_id === newItem.product_id
                ? { ...i, qty: i.qty + qty }
                : i
            ),
          })
        } else {
          set({
            items: [
              ...items,
              { ...newItem, qty, added_at: new Date().toISOString() },
            ],
          })
        }
      },

      removeItem: product_id => {
        set({ items: get().items.filter(i => i.product_id !== product_id) })
      },

      updateQty: (product_id, qty) => {
        if (qty <= 0) {
          set({ items: get().items.filter(i => i.product_id !== product_id) })
          return
        }
        set({
          items: get().items.map(i =>
            i.product_id === product_id ? { ...i, qty } : i
          ),
        })
      },

      setSelectedGift: giftId => set({ selectedGiftId: giftId }),

      clear: () => set({ items: [], selectedGiftId: null }),

      getItemCount: () =>
        get().items.reduce((sum, i) => sum + i.qty, 0),

      getSubtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.qty, 0),

      getRawPointsToEarn: () =>
        get().items.reduce((sum, i) => sum + i.points_per_unit * i.qty, 0),
    }),
    {
      name: 'vuabim-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({
        items: state.items,
        selectedGiftId: state.selectedGiftId,
      }),
      onRehydrateStorage: () => state => {
        state?.setHydrated()
      },
    }
  )
)
