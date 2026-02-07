"use client";

import { useEffect, useState } from "react";
import { Download, Calendar, TrendingUp, Users, Car, Brain } from "lucide-react";
import PeakHoursChart from "@/components/analytics/PeakHoursChart";
import OccupancyTrends from "@/components/analytics/OccupancyTrends";
import RevenueChart from "@/components/analytics/RevenueChart";
import AIAccuracyChart from "@/components/analytics/AIAccuracyChart";

interface AnalyticsData {
  overview: {
    totalSlots: number;
    occupiedSlots: number;
    availableSlots: number;
    reservedSlots: number;
    occupancyRate: number;
    avgConfidence: number;
  };
  peakHours: {
    hourlyData: Array<{ hour: number; count: number; label: string }>;
    peakHour: number;
    peakHourLabel: string;
    peakOccupancy: number;
  };
  occupancyTrends: Array<{
    date: string;
    occupied: number;
    available: number;
    total: number;
  }>;
  revenue: {
    totalRevenue: number;
    totalBookings: number;
    avgRevenuePerDay: number;
    avgBookingsPerDay: number;
    pricePerHour: number;
    estimatedMonthlyRevenue: number;
  };
  aiAccuracy: {
    totalPredictions: number;
    correctPredictions: number;
    accuracy: number;
    confidence: number;
  };
  customerMetrics: {
    totalCustomers: number;
    repeatCustomers: number;
    repeatRate: number;
    avgBookingDuration: number;
  };
}

export default function OwnerAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState(7);

  useEffect(() => {
    fetchAnalytics();
  }, [selectedPeriod]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/owner/analytics?days=${selectedPeriod}`);
      const data = await response.json();
      if (data.success) {
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportData = () => {
    if (!analytics) return;
    
    const csvContent = [
      ["Metric", "Value"],
      ["Total Slots", analytics.overview.totalSlots],
      ["Occupancy Rate", `${analytics.overview.occupancyRate}%`],
      ["Total Revenue", `₹${analytics.revenue.totalRevenue}`],
      ["Total Bookings", analytics.revenue.totalBookings],
      ["AI Accuracy", `${analytics.aiAccuracy.accuracy}%`],
      ["Total Customers", analytics.customerMetrics.totalCustomers],
      ["Peak Hour", analytics.peakHours.peakHourLabel],
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-red-400">Failed to load analytics</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="text-cyan-400" />
            Analytics Dashboard
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Insights and performance metrics for your parking lot
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(Number(e.target.value))}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
          >
            <option value={7}>Last 7 Days</option>
            <option value={14}>Last 14 Days</option>
            <option value={30}>Last 30 Days</option>
          </select>

          <button
            onClick={exportData}
            className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg transition text-sm"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <OverviewCard
          icon={<Car className="text-cyan-400" />}
          label="Occupancy Rate"
          value={`${analytics.overview.occupancyRate}%`}
          subtext={`${analytics.overview.occupiedSlots}/${analytics.overview.totalSlots} slots`}
        />
        <OverviewCard
          icon={<Calendar className="text-green-400" />}
          label="Total Bookings"
          value={analytics.revenue.totalBookings.toString()}
          subtext={`₹${analytics.revenue.totalRevenue.toLocaleString()} revenue`}
        />
        <OverviewCard
          icon={<Brain className="text-purple-400" />}
          label="AI Accuracy"
          value={`${analytics.aiAccuracy.accuracy.toFixed(1)}%`}
          subtext={`${analytics.aiAccuracy.totalPredictions} predictions`}
        />
        <OverviewCard
          icon={<Users className="text-yellow-400" />}
          label="Customers"
          value={analytics.customerMetrics.totalCustomers.toString()}
          subtext={`${analytics.customerMetrics.repeatRate}% repeat rate`}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <PeakHoursChart 
          data={analytics.peakHours.hourlyData} 
          peakHour={analytics.peakHours.peakHour} 
        />
        <OccupancyTrends data={analytics.occupancyTrends} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RevenueChart
          totalRevenue={analytics.revenue.totalRevenue}
          commission={analytics.revenue.totalRevenue * 0.12} // 12% commission
          tax={analytics.revenue.totalRevenue * 0.18} // 18% GST
          netPayout={analytics.revenue.totalRevenue * 0.7} // 70% net
        />
        <AIAccuracyChart
          accuracy={analytics.aiAccuracy.accuracy}
          confidence={analytics.aiAccuracy.confidence}
          totalPredictions={analytics.aiAccuracy.totalPredictions}
          correctPredictions={analytics.aiAccuracy.correctPredictions}
        />
      </div>

      {/* Additional Insights */}
      <div className="mt-8 bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Key Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <InsightItem
            title="Peak Performance"
            description={`Your busiest time is ${analytics.peakHours.peakHourLabel} with ${analytics.peakHours.peakOccupancy} occupancy events.`}
          />
          <InsightItem
            title="Revenue Trend"
            description={`Average daily revenue is ₹${analytics.revenue.avgRevenuePerDay.toLocaleString()}. Estimated monthly: ₹${Math.round(analytics.revenue.estimatedMonthlyRevenue).toLocaleString()}.`}
          />
          <InsightItem
            title="AI Reliability"
            description={`AI system is performing at ${analytics.aiAccuracy.accuracy.toFixed(1)}% accuracy with ${analytics.aiAccuracy.confidence.toFixed(1)}% average confidence.`}
          />
        </div>
      </div>
    </div>
  );
}

function OverviewCard({
  icon,
  label,
  value,
  subtext,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext: string;
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-gray-400 text-sm">{label}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-gray-500 mt-1">{subtext}</div>
    </div>
  );
}

function InsightItem({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="bg-gray-800/50 rounded-lg p-4">
      <h4 className="font-medium text-cyan-400 mb-1">{title}</h4>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}
