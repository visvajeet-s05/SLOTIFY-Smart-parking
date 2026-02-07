import CountUp from "react-countup"

export default function StatCard({ label, value, color }: any) {
  return (
    <div className="bg-[#0b1220] p-5 rounded-xl">
      <p className="text-sm text-gray-400">{label}</p>
      <h2 className={`text-3xl font-bold ${color}`}>
        <CountUp end={value} duration={1.6} />
      </h2>
    </div>
  )
}