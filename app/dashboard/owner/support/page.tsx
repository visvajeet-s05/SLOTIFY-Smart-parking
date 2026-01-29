"use client"

import { useState, useEffect } from "react"

export default function OwnerSupportPage() {
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [tickets, setTickets] = useState<any[]>([])

  useEffect(() => {
    fetchTickets()
  }, [])

  async function fetchTickets() {
    const res = await fetch("/api/owner/support")
    if (res.ok) {
      const data = await res.json()
      setTickets(data)
    }
  }

  async function submitTicket() {
    await fetch("/api/owner/support", {
      method: "POST",
      body: JSON.stringify({ subject, message }),
    })
    setSubject("")
    setMessage("")
    alert("Support ticket submitted")
    fetchTickets()
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Owner Support</h1>
        <p className="text-sm text-gray-400">
          Get help from the Smart Parking support team
        </p>
      </div>

      {/* Create Ticket */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-5 space-y-4">
        <h3 className="font-medium">Create Support Ticket</h3>

        <input
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
        />

        <textarea
          placeholder="Describe your issue"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm h-32"
        />

        <button
          onClick={submitTicket}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm"
        >
          Submit Ticket
        </button>
      </div>

      {/* Ticket History */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
        <h3 className="font-medium mb-3">My Tickets</h3>

        {tickets.length === 0 ? (
          <div className="text-sm text-gray-400">No tickets yet</div>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="border border-gray-700 rounded p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{ticket.subject}</h4>
                    <p className="text-sm text-gray-400 mt-1">{ticket.message}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    ticket.status === 'OPEN' ? 'bg-yellow-600' :
                    ticket.status === 'IN_PROGRESS' ? 'bg-blue-600' :
                    'bg-green-600'
                  }`}>
                    {ticket.status}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
