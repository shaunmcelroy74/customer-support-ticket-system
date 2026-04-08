'use client'

// Import Supabase client for database operations and auth
import { supabase } from '../../supabaseClient'
// Import React hooks for state management and side effects
import { useState, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'

// Define the structure of a Ticket object using TypeScript interface
interface Ticket {
  id: number
  title: string
  description: string
  status: string
  created_at: string
}

// Main component for the home page of the customer support ticket system
export default function Home() {
  // State to hold the current authenticated user
  const [user, setUser] = useState<User | null>(null)
  // State to hold the list of tickets fetched from the database
  const [tickets, setTickets] = useState<Ticket[]>([])
  // State for the title input in the ticket creation form
  const [title, setTitle] = useState('')
  // State for the description input in the ticket creation form
  const [description, setDescription] = useState('')
  // State to indicate if data is currently being loaded
  const [loading, setLoading] = useState(false)
  // State for auth form inputs
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  // State to toggle between login and signup modes
  const [isLogin, setIsLogin] = useState(true)

  // useEffect hook to handle authentication state changes
  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
    }
    getInitialSession()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // useEffect hook to fetch tickets when the user is logged in
  useEffect(() => {
    if (user) {
      fetchTickets()
    }
  }, [user])

  // Function to fetch all tickets from the Supabase database
  const fetchTickets = async () => {
    // Set loading to true while fetching data
    setLoading(true)
    // Query the 'tickets' table to select all records
    const { data, error } = await supabase.from('tickets').select('*').order('created_at', { ascending: false })
    // Log any errors that occur during fetching
    if (error) console.error('Error fetching tickets:', error)
    // Update the tickets state with the fetched data
    else setTickets(data)
    // Set loading to false after fetching completes
    setLoading(false)
  }

  // Function to handle ticket creation form submission
  const createTicket = async (e: React.FormEvent<HTMLFormElement>) => {
    // Prevent the default form submission behavior
    e.preventDefault()
    // Insert a new ticket into the 'tickets' table with title, description, and a default status of 'open'
    const { data, error } = await supabase.from('tickets').insert([{ title, description, status: 'open' }])
    // Log any errors that occur during insertion
    if (error) console.error('Error creating ticket:', error)
    // On success, clear the form inputs and refresh the ticket list
    else {
      setTitle('')
      setDescription('')
      fetchTickets()
    }
  }

  // Function to update a ticket's status in the database
  const updateTicketStatus = async (ticketId: number, newStatus: string) => {
    // Update the 'tickets' table where the id matches ticketId, setting the new status
    const { error } = await supabase.from('tickets').update({ status: newStatus }).eq('id', ticketId)
    // Log any errors that occur during the update
    if (error) console.error('Error updating ticket status:', error)
    // On success, refresh the ticket list to reflect the change
    else fetchTickets()
  }

  // Function to delete a ticket from the database
  const deleteTicket = async (ticketId: number) => {
    // Delete the ticket from the 'tickets' table where the id matches ticketId
    const { error } = await supabase.from('tickets').delete().eq('id', ticketId)
    // Log any errors that occur during deletion
    if (error) console.error('Error deleting ticket:', error)
    // On success, refresh the ticket list to reflect the change
    else fetchTickets()
  }

  // Function to handle user signup
  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) console.error('Error signing up:', error)
    else {
      alert('Signup successful! Please check your email for verification.')
      setEmail('')
      setPassword('')
    }
  }

  // Function to handle user login
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) console.error('Error logging in:', error)
    else {
      setEmail('')
      setPassword('')
    }
  }

  // Function to handle user logout
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) console.error('Error logging out:', error)
    else setTickets([])
  }

  // Render the UI
  return (
    // Main container with padding
    <main className="p-6">
      {/* Page title */}
      <h1 className="text-2xl font-bold mb-4">Customer Support Ticket System</h1>

      {user ? (
        // Logged-in user interface
        <>
          {/* Logout button */}
          <button onClick={handleLogout} className="mb-4 bg-gray-500 text-white px-4 py-2 rounded">
            Logout
          </button>

          {/* Form for creating a new ticket */}
          <form onSubmit={createTicket} className="mb-6">
            {/* Input for ticket title */}
            <input
              type="text"
              placeholder="Ticket Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border p-2 mr-2"
              required
            />
            {/* Input for ticket description */}
            <input
              type="text"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border p-2 mr-2"
              required
            />
            {/* Submit button to create the ticket */}
            <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">Create Ticket</button>
          </form>

          {/* Section header for the tickets list */}
          <h2 className="text-xl font-semibold mb-2">Tickets</h2>
          {/* Show loading message while fetching tickets */}
          {loading && <p>Loading...</p>}
          {/* Unordered list to display all tickets */}
          <ul>
            {/* Map over the tickets array to render each ticket */}
            {tickets.map((ticket) => (
              <li key={ticket.id} className="border p-3 mb-2 rounded shadow-sm">
                {/* Display ticket title in bold, followed by description */}
                <strong>{ticket.title}</strong>: {ticket.description}
                {/* Dropdown to change the ticket status */}
                <select
                  value={ticket.status}
                  onChange={(e) => updateTicketStatus(ticket.id, e.target.value)}
                  className="ml-4 p-1 border rounded bg-white text-black"
                >
                  <option value="open">Open</option>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
                {/* Delete button to remove the ticket */}
                <button
                  onClick={() => deleteTicket(ticket.id)}
                  className="ml-2 bg-red-500 text-white px-2 py-1 rounded"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : (
        // Authentication interface
        <>
          {/* Toggle between login and signup */}
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

          {/* Auth form */}
          <form onSubmit={isLogin ? handleLogin : handleSignup} className="mb-6">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border p-2 mr-2 bg-white text-black"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border p-2 mr-2 bg-white text-black"
              required
            />
            <button type="submit" className="bg-white text-black px-4 py-2 rounded border border-black">
              {isLogin ? 'Login' : 'Signup'}
            </button>
          </form>
        </>
      )}
    </main>
  )
}