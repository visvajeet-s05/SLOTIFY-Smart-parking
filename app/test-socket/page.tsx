"use client"

import { useEffect, useState } from 'react'
import { useParkingSocket } from '@/hooks/useParkingSocket'

export default function TestSocketPage() {
  const [messages, setMessages] = useState<string[]>([])
  const [status, setStatus] = useState('Connecting...')

  // Use WebSocket hook
  useParkingSocket({
    onSlotUpdate: (data: any) => {
      const message = `📡 Received: ${data.parkingId} - ${data.availableSlots} slots`
      setMessages(prev => [...prev, message])
    }
  })

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">WebSocket Test Page</h1>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Status: <span className="text-green-400">{status}</span></h2>
          
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2">Messages:</h3>
            <div className="bg-gray-900 rounded p-4 h-96 overflow-y-auto">
              {messages.length === 0 ? (
                <p className="text-gray-500">No messages received yet...</p>
              ) : (
                messages.map((msg, index) => (
                  <div key={index} className="mb-2 p-2 bg-gray-800 rounded">
                    {msg}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setStatus('Simulating connection...')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
            >
              Test Connection
            </button>
            <button
              onClick={() => setMessages([])}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded"
            >
              Clear Messages
            </button>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">WebSocket Debug Information</h3>
          <p className="text-sm text-gray-400 mb-2">
            This page uses the same WebSocket connection as the main application.
          </p>
          <p className="text-sm text-gray-400">
            If you don't see any messages, check the browser console for errors.
          </p>
        </div>
      </div>
    </div>
  )
}