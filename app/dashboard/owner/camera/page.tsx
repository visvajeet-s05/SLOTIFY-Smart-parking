"use client";

export default function OwnerCameraPage() {
  const streamUrl = "http://localhost:5000/camera";

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Live Camera Feed</h1>

      <div className="rounded-xl overflow-hidden border border-gray-700">
        <img
          src={streamUrl}
          alt="Live Camera"
          className="w-full h-[500px] object-cover bg-black"
          onError={() => console.error("Camera stream not reachable")}
        />
      </div>
    </div>
  );
}
