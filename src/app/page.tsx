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
  // State to indicate if data is currently being loaded
  const [loading, setLoading] = useState(false)

  // useEffect hook to fetch tickets when the component mounts
  useEffect(() => {
    fetchTickets()
  }, [])

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
          </li>
        ))}
      </ul>
    </main>
  )
}