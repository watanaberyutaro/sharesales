import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { User } from '@/types/database'

interface SupabaseState {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  signUp: (email: string, password: string, name: string, role: string) => Promise<{ success: boolean; error?: string }>
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<{ success: boolean; error?: string }>
  initialize: () => Promise<void>
}

export const useSupabaseStore = create<SupabaseState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  loading: true,

  signUp: async (email, password, name, role) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) throw authError

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email,
            name,
            role: role as User['role'],
          })

        if (profileError) throw profileError

        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', authData.user.id)
          .single()

        set({ user: userData, isAuthenticated: true })
        return { success: true }
      }

      return { success: false, error: 'Failed to create user' }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  signIn: async (email, password) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) throw authError

      if (authData.user) {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', authData.user.id)
          .single()

        set({ user: userData, isAuthenticated: true })
        return { success: true }
      }

      return { success: false, error: 'Failed to sign in' }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, isAuthenticated: false })
  },

  updateProfile: async (data) => {
    try {
      const userId = get().user?.id
      if (!userId) throw new Error('No user logged in')

      const { error } = await supabase
        .from('users')
        .update(data)
        .eq('id', userId)

      if (error) throw error

      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      set({ user: userData })
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()

        set({ user: userData, isAuthenticated: true, loading: false })
      } else {
        set({ loading: false })
      }

      supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()

          set({ user: userData, isAuthenticated: true })
        } else {
          set({ user: null, isAuthenticated: false })
        }
      })
    } catch (error) {
      console.error('Failed to initialize auth:', error)
      set({ loading: false })
    }
  },
}))