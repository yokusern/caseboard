'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { onAuthStateChanged, User } from 'firebase/auth'
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { seedSampleCases } from '@/lib/firestore'
import { UserProfile } from '@/types'

interface AuthContextValue {
  user: User | null
  profile: UserProfile | null
  loading: boolean
}

const AuthContext = createContext<AuthContextValue>({ user: null, profile: null, loading: true })

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    return onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      if (!firebaseUser) {
        setProfile(null)
        setLoading(false)
      }
    })
  }, [])

  useEffect(() => {
    if (!user) return

    const userRef = doc(db, 'users', user.uid)
    return onSnapshot(userRef, async (snap) => {
      if (!snap.exists()) {
        await setDoc(userRef, {
          email: user.email ?? '',
          displayName: user.displayName ?? '',
          plan: 'free',
          stripeCustomerId: '',
          hasSeenOnboarding: true,
          createdAt: serverTimestamp(),
        })
        await seedSampleCases(user.uid)
        setProfile({
          email: user.email ?? '',
          displayName: user.displayName ?? '',
          plan: 'free',
          stripeCustomerId: '',
          hasSeenOnboarding: true,
          createdAt: '',
        })
      } else {
        const data = snap.data()
        setProfile({
          email: data.email ?? '',
          displayName: data.displayName ?? '',
          plan: data.plan ?? 'free',
          stripeCustomerId: data.stripeCustomerId ?? '',
          createdAt: data.createdAt?.toDate().toISOString() ?? '',
        })
      }
      setLoading(false)
    })
  }, [user])

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
