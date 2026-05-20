'use client'


// Import React state hook
import { useState } from 'react'
// Import the initialized Supabase client
import { supabase } from '../../../supabaseClient'
// Import User type for type safety
import type { User } from '@supabase/supabase-js'


// Props for the Auth component: expects a setUser function to update the authenticated user in parent
interface AuthProps {
  setUser: (user: User | null) => void
}


// Auth component handles login and signup forms and logic
export default function Auth({ setUser }: AuthProps) {
  // State for email input
  const [email, setEmail] = useState('')
  // State for password input
  const [password, setPassword] = useState('')
  // State to toggle between login and signup modes
  const [isLogin, setIsLogin] = useState(true)
  // State for displaying error messages
  const [errorMsg, setErrorMsg] = useState('')


  // Handles user login with Supabase Auth
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMsg('')
    // Attempt to sign in with email and password
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setErrorMsg(error.message) // Show error if login fails
    else setUser(data.user) // Set user in parent on success
  }


  // Handles user signup with Supabase Auth
  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMsg('')
    // Attempt to sign up with email and password
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) setErrorMsg(error.message) // Show error if signup fails
    else {
      // On success, prompt user to check email for verification
      alert('Signup successful! Please check your email for verification.')
      setEmail('')
      setPassword('')
    }
  }

  // Render the authentication form UI
  return (
    <div className="p-4 border rounded shadow-sm max-w-md">
      {/* Toggle between Login and Signup modes */}
      <div className="mb-4">
        <button
          onClick={() => setIsLogin(true)}
          className={`mr-2 px-4 py-2 rounded border ${isLogin ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}
        >
          Login
        </button>
        <button
          onClick={() => setIsLogin(false)}
          className={`px-4 py-2 rounded border ${!isLogin ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}
        >
          Signup
        </button>
      </div>

      {/* Auth form for login or signup */}
      <form onSubmit={isLogin ? handleLogin : handleSignup}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 mb-2 w-full"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 mb-2 w-full"
          required
        />
        <button type="submit" className="bg-white text-black px-4 py-2 rounded border border-black w-full">
          {isLogin ? 'Login' : 'Signup'}
        </button>
      </form>

      {/* Display error message if present */}
      {errorMsg && <p className="text-red-500 mt-2">{errorMsg}</p>}
    </div>
  )
}
