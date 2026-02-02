'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, Mail, Lock, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface AuthFormProps {
  mode: 'login' | 'signup'
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    const supabase = createClient()

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      })

      if (error) {
        setError(error.message)
      } else {
        setMessage('Check your email to confirm your account!')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
      } else {
        router.push('/')
        router.refresh()
      }
    }

    setLoading(false)
  }

  return (
    <Card className="card-storybook border-2">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-3xl font-heading font-bold text-stone-800 tracking-tight">
          {mode === 'login' ? 'Welcome Back! 👋' : 'Join Us! 🎉'}
        </CardTitle>
        <p className="text-stone-500 font-bold font-heading">
          {mode === 'login'
            ? 'Sign in to access your classroom'
            : 'Create an account to get started'}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-bold text-stone-600 mb-1 block font-heading">
                  First Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <Input
                    type="text"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="pl-10 bg-stone-50 border-stone-200 focus-visible:ring-primary font-bold"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-bold text-stone-600 mb-1 block font-heading">
                  Last Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <Input
                    type="text"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="pl-10 bg-stone-50 border-stone-200 focus-visible:ring-primary font-bold"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="text-sm font-bold text-stone-600 mb-1 block font-heading">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <Input
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-stone-50 border-stone-200 focus-visible:ring-primary font-bold"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-stone-600 mb-1 block font-heading">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 bg-stone-50 border-stone-200 focus-visible:ring-primary font-bold"
                required
                minLength={6}
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border-2 border-red-100 text-red-600 text-sm font-bold font-heading">
              ❌ {error}
            </div>
          )}

          {message && (
            <div className="p-3 rounded-xl bg-green-50 border-2 border-green-100 text-green-600 text-sm font-bold font-heading">
              ✅ {message}
            </div>
          )}

          <Button
            type="submit"
            className="w-full text-lg font-bold btn-storybook bg-primary text-stone-800 hover:bg-primary/90 mt-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {mode === 'login' ? 'Signing in...' : 'Creating account...'}
              </>
            ) : mode === 'login' ? (
              '🚀 Sign In'
            ) : (
              '✨ Create Account'
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm font-bold text-stone-500">
          {mode === 'login' ? (
            <p>
              Don&apos;t have an account?{' '}
              <Link
                href="/signup"
                className="text-primary hover:text-primary/80 underline decoration-2 underline-offset-2"
              >
                Sign up
              </Link>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-primary hover:text-primary/80 underline decoration-2 underline-offset-2"
              >
                Sign in
              </Link>
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
