'use client'

import { supabase } from '../../supabaseClient'
import { useState, useEffect } from 'react'

export default function Home() {
  const [tickets, setTickets] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    const { data, error } = await supabase.from('tickets').select('*')
    if (error) console.error('Error fetching tickets:', error)
    else setTickets(data)
  }

  const createTicket = async (e) => {
    e.preventDefault()
    const { data, error } = await supabase.from('tickets').insert([{ title, description }])
    if (error) console.error('Error creating ticket:', error)
    else {
      setTitle('')
      setDescription('')
      fetchTickets()
    }
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Customer Support Ticket System</h1>

      <form onSubmit={createTicket} className="mb-6">
        <input
          type="text"
          placeholder="Ticket Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 mr-2"
          required
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border p-2 mr-2"
          required
        />
        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">Create Ticket</button>
      </form>

      <h2 className="text-xl font-semibold mb-2">Tickets</h2>
      <ul>
        {tickets.map((ticket) => (
          <li key={ticket.id} className="border p-2 mb-2">
            <strong>{ticket.title}</strong>: {ticket.description} (Status: {ticket.status})
          </li>
        ))}
      </ul>
    </main>
  )
}