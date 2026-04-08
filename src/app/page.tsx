'use client'

// Import Supabase client for database operations
import { supabase } from '../../supabaseClient'
// Import React hooks for state management and side effects
import { useState, useEffect } from 'react'

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
  // State to hold the list of tickets fetched from the database
  const [tickets, setTickets] = useState<Ticket[]>([])
  // State for the title input in the ticket creation form
  const [title, setTitle] = useState('')
  // State for the description input in the ticket creation form
  const [description, setDescription] = useState('')

  // useEffect hook to fetch tickets when the component mounts
  useEffect(() => {
    fetchTickets()
  }, [])

  // Function to fetch all tickets from the Supabase database
  const fetchTickets = async () => {
    // Query the 'tickets' table to select all records
    const { data, error } = await supabase.from('tickets').select('*')
    // Log any errors that occur during fetching
    if (error) console.error('Error fetching tickets:', error)
    // Update the tickets state with the fetched data
    else setTickets(data)
  }

  // Function to handle ticket creation form submission
  const createTicket = async (e) => {
    // Prevent the default form submission behavior
    e.preventDefault()
    // Insert a new ticket into the 'tickets' table with title and description
    const { data, error } = await supabase.from('tickets').insert([{ title, description }])
    // Log any errors that occur during insertion
    if (error) console.error('Error creating ticket:', error)
    // On success, clear the form inputs and refresh the ticket list
    else {
      setTitle('')
      setDescription('')
      fetchTickets()
    }
  }

  // Render the UI
  return (
    // Main container with padding
    <main className="p-6">
      {/* Page title */}
      <h1 className="text-2xl font-bold mb-4">Customer Support Ticket System</h1>

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
      {/* Unordered list to display all tickets */}
      <ul>
        {/* Map over the tickets array to render each ticket */}
        {tickets.map((ticket) => (
          <li key={ticket.id} className="border p-2 mb-2">
            {/* Display ticket title in bold, followed by description and status */}
            <strong>{ticket.title}</strong>: {ticket.description} (Status: {ticket.status})
          </li>
        ))}
      </ul>
    </main>
  )
}