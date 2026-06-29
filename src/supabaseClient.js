import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

// دالة لتحديد نوع التخزين (local للدوام، session للمؤقت)
const getStorage = () => {
  const rememberMe = localStorage.getItem('rememberMe') === 'true'
  return rememberMe ? localStorage : sessionStorage
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: {
      getItem: (key) => getStorage().getItem(key),
      setItem: (key, value) => getStorage().setItem(key, value),
      removeItem: (key) => getStorage().removeItem(key),
    },
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})