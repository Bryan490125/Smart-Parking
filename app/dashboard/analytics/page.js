"use client";

import { useState, useEffect } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    PointElement,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend
);

export default function AnalyticsPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/admin/analytics");
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to fetch analytics");
            }
            const json = await res.json();
            setData(json);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, []);

    if (loading) return <div className="loading">Loading analytics...</div>;
    if (error) return <div className="error">{error}</div>;

    const { summary, zoneRanking, peakPeriods } = data;

    // Formatting Data for Zone Ranking Chart
    const zoneLabels = zoneRanking.map((z) => z.zoneName);
    const zoneDataCounts = zoneRanking.map((z) => z.count);

    const zoneChartData = {
        labels: zoneLabels,
        datasets: [
            {
                label: "Reservations per Zone",
                data: zoneDataCounts,
                backgroundColor: "rgba(54, 162, 235, 0.6)",
                borderColor: "rgba(54, 162, 235, 1)",
                borderWidth: 1,
            },
        ],
    };

    // Formatting Data for Peak Periods Chart
    const peakLabels = peakPeriods.map((p) => `${String(p.hour).padStart(2, "0")}:00`);
    const peakDataCounts = peakPeriods.map((p) => p.count);

    const peakChartData = {
        labels: peakLabels,
        datasets: [
            {
                label: "Reservations by Hour",
                data: peakDataCounts,
                backgroundColor: "rgba(75, 192, 192, 0.4)",
                borderColor: "rgba(75, 192, 192, 1)",
                tension: 0.3,
                fill: true,
            },
        ],
    };

    return (
        <div className="analytics-container space-y-8 p-6">
            <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="summary-card bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-500">
                    <h3 className="text-gray-500 text-sm font-semibold uppercase">Total Reservations</h3>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{summary.total}</p>
                </div>
                <div className="summary-card bg-white p-6 rounded-lg shadow-md border-t-4 border-green-500">
                    <h3 className="text-gray-500 text-sm font-semibold uppercase">Active Reservations</h3>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{summary.active}</p>
                </div>
                <div className="summary-card bg-white p-6 rounded-lg shadow-md border-t-4 border-red-500">
                    <h3 className="text-gray-500 text-sm font-semibold uppercase">Cancelled Reservations</h3>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{summary.cancelled}</p>
                </div>
                <div className="summary-card bg-white p-6 rounded-lg shadow-md border-t-4 border-yellow-500">
                    <h3 className="text-gray-500 text-sm font-semibold uppercase">Today's Reservations</h3>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{summary.today}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                {/* Zone Ranking Chart */}
                <div className="chart-container bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-4">Zone Ranking</h2>
                    <div style={{ position: "relative", height: "300px" }}>
                        <Bar
                            data={zoneChartData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        ticks: { stepSize: 1 },
                                    },
                                },
                            }}
                        />
                    </div>
                </div>

                {/* Peak Periods Chart */}
                <div className="chart-container bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-4">Peak Periods</h2>
                    <div style={{ position: "relative", height: "300px" }}>
                        <Line
                            data={peakChartData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        ticks: { stepSize: 1 },
                                    },
                                },
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Zone Ranking Table */}
            <div className="table-container bg-white p-6 rounded-lg shadow-md mt-8">
                <h2 className="text-xl font-bold mb-4">Zone Ranking Detail</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-100 text-gray-600">
                                <th className="p-3 border-b-2 font-semibold">Rank</th>
                                <th className="p-3 border-b-2 font-semibold">Zone Name</th>
                                <th className="p-3 border-b-2 font-semibold">Total Reservations</th>
                            </tr>
                        </thead>
                        <tbody>
                            {zoneRanking.length > 0 ? (
                                zoneRanking.map((zone, index) => (
                                    <tr key={zone.zoneName} className="border-b hover:bg-gray-50">
                                        <td className="p-3">#{index + 1}</td>
                                        <td className="p-3">{zone.zoneName}</td>
                                        <td className="p-3 font-semibold text-blue-600">{zone.count}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="p-4 text-center text-gray-500">
                                        No reservations found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
