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
  assigned_user_id: string | null
}

// Main component for the home page of the customer support ticket system
export default function Home() {
  // State to hold the current authenticated user
  const [user, setUser] = useState<User | null>(null)
  // State to hold the list of tickets fetched from the database
  const [tickets, setTickets] = useState<Ticket[]>([])
  // State for ticket filter
  const [ticketFilter, setTicketFilter] = useState<'all' | 'assigned' | 'created'>('created')
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
  // State for users list and selected assignee
  const [users, setUsers] = useState<{ id: string, email: string }[]>([])
  const [assignedUserId, setAssignedUserId] = useState<string>('')
  // Track which ticket is being assigned
  const [assigningTicketId, setAssigningTicketId] = useState<number | null>(null)

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

  // useEffect hook to fetch tickets and users when the user is logged in or filter changes
  useEffect(() => {
    if (user) {
      fetchTickets()
      fetchUsers()
    }
  }, [user, ticketFilter])

  // Fetch all users for assignment from the public profiles table
  const fetchUsers = async () => {
    const { data, error } = await supabase.from('profiles').select('id, email')
    if (!error && data) setUsers(data)
  }

  // Function to fetch tickets based on filter
  const fetchTickets = async () => {
    setLoading(true)
    if (!user) {
      setTickets([])
      setLoading(false)
      return
    }
    let query = supabase.from('tickets').select('*').order('created_at', { ascending: false })
    if (ticketFilter === 'created') {
      query = query.eq('user_id', user.id)
    } else if (ticketFilter === 'assigned') {
      query = query.eq('assigned_user_id', user.id)
    }
    const { data, error } = await query
    if (error) console.error('Error fetching tickets:', error)
    else setTickets(data)
    setLoading(false)
  }

  // Function to handle ticket creation form submission
  const createTicket = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const { data, error } = await supabase.from('tickets').insert([
      {
        title,
        description,
        status: 'open',
        user_id: user?.id,
        assigned_user_id: assignedUserId || null
      }
    ])
    if (error) console.error('Error creating ticket:', error)
    else {
      setTitle('')
      setDescription('')
      setAssignedUserId('')
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
            {/* Dropdown for assigning user by email */}
            <select
              value={assignedUserId}
              onChange={e => setAssignedUserId(e.target.value)}
              className="border p-2 mr-2 text-black bg-white"
              required
            >
              <option value="">Assign to...</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.email}</option>
              ))}
            </select>
            {/* Submit button to create the ticket */}
            <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">Create Ticket</button>
          </form>

          {/* Section header and filter for the tickets list */}
          <div className="flex items-center mb-2">
            <h2 className="text-xl font-semibold mr-4">Tickets</h2>
            <select
              value={ticketFilter}
              onChange={e => setTicketFilter(e.target.value as 'all' | 'assigned' | 'created')}
              className="border p-2 text-black bg-white"
            >
              <option value="all">All tickets</option>
              <option value="assigned">Assigned to me</option>
              <option value="created">Created by me</option>
            </select>
          </div>
          {/* Show loading message while fetching tickets */}
          {loading && <p>Loading...</p>}
          {/* Unordered list to display all tickets */}
          <ul>
            {/* Map over the tickets array to render each ticket */}
            {tickets.map((ticket) => {
              // Find the assigned user's email
              const assignedUser = users.find(u => u.id === ticket.assigned_user_id);
              return (
                <li key={ticket.id} className="border p-3 mb-2 rounded shadow-sm">
                  <strong>{ticket.title}</strong>: {ticket.description}
                  {/* Show assigned user and allow changing */}
                  <div className="mt-2 flex flex-col items-start gap-2">
                    <label className="flex items-center">
                      <span className="mr-2">Assigned to:</span>
                      <select
                        value={ticket.assigned_user_id || ''}
                        onChange={async (e) => {
                          setAssigningTicketId(ticket.id);
                          const newUserId = e.target.value;
                          const { error } = await supabase.from('tickets').update({ assigned_user_id: newUserId }).eq('id', ticket.id);
                          await fetchTickets();
                          setAssigningTicketId(null);
                        }}
                        className="p-1 border rounded bg-white text-black"
                        disabled={assigningTicketId === ticket.id}
                        style={{ minWidth: '160px' }}
                      >
                        <option value="">Unassigned</option>
                        {users.map(u => (
                          <option key={u.id} value={u.id}>{u.email}</option>
                        ))}
                      </select>
                    </label>
                    <div className="flex items-center" style={{ marginLeft: '95px' }}>
                      <select
                        value={ticket.status}
                        onChange={(e) => updateTicketStatus(ticket.id, e.target.value)}
                        className="p-1 border rounded bg-white text-black"
                        style={{ minWidth: '160px' }}
                      >
                        <option value="open">Open</option>
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                      <button
                        onClick={() => deleteTicket(ticket.id)}
                        className="ml-2 bg-red-500 text-white px-2 py-1 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
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