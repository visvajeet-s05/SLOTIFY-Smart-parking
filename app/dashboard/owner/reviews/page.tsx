"use client"

export default function OwnerReviewsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Customer Reviews</h1>
        <p className="text-sm text-gray-400">
          View and respond to feedback from customers.
        </p>
      </div>

      {/* Rating Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="admin-card">
          <div className="text-xs text-gray-400">Average Rating</div>
          <div className="text-xl font-semibold">4.3 ⭐</div>
        </div>
        <div className="admin-card">
          <div className="text-xs text-gray-400">Total Reviews</div>
          <div className="text-xl font-semibold">128</div>
        </div>
        <div className="admin-card">
          <div className="text-xs text-gray-400">Positive</div>
          <div className="text-xl font-semibold text-green-400">92</div>
        </div>
        <div className="admin-card">
          <div className="text-xs text-gray-400">Negative</div>
          <div className="text-xl font-semibold text-red-400">36</div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 space-y-4">
        <ReviewCard
          user="Rohit Sharma"
          rating={5}
          comment="Very smooth parking experience. Easy entry!"
          parking="MG Road Parking"
          date="12 Aug 2026"
        />

        <ReviewCard
          user="Ananya Patel"
          rating={3}
          comment="Good location but a bit crowded in the evening."
          parking="City Center Lot"
          date="10 Aug 2026"
        />
      </div>
    </div>
  )
}

/* ---------- Review Card ---------- */

function ReviewCard({
  user,
  rating,
  comment,
  parking,
  date,
}: {
  user: string
  rating: number
  comment: string
  parking: string
  date: string
}) {
  return (
    <div className="border border-gray-800 rounded-lg p-4 space-y-2">
      <div className="flex justify-between items-center">
        <div>
          <div className="font-medium">{user}</div>
          <div className="text-xs text-gray-500">
            {parking} • {date}
          </div>
        </div>
        <div className="text-yellow-400 text-sm">
          {"⭐".repeat(rating)}
        </div>
      </div>

      <p className="text-sm text-gray-300">{comment}</p>

      <textarea
        placeholder="Write a reply..."
        className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm"
      />

      <button className="px-4 py-1.5 bg-purple-600 rounded text-sm hover:bg-purple-700">
        Reply
      </button>
    </div>
  )
}
