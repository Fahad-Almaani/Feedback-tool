import React, { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";

/**
 * Admin Dashboard Page 
 *Tailwind CSS for styling (clean and minimal)
 */

// Placeholder API calls (replace later with MySQL-backed API endpoints)
const api = {
  async listSurveys() {
    // Replace with: fetch('/api/surveys')
    return [
      { id: 1, title: "Customer Satisfaction Q3", status: "ACTIVE" },
      { id: 2, title: "Website Feedback", status: "INACTIVE" },
    ];
  },
  async getSurveySummary(id) {
    // Replace with: fetch(`/api/surveys/${id}/summary`)
    return {
      totalResponses: 120,
      averageRating: 4.3,
      responsesOverTime: [
        { date: "2025-08-01", count: 12 },
        { date: "2025-08-02", count: 15 },
      ],
      ratingDistribution: [
        { rating: 1, value: 5 },
        { rating: 2, value: 10 },
        { rating: 3, value: 25 },
        { rating: 4, value: 40 },
        { rating: 5, value: 40 },
      ],
      multipleChoiceBreakdown: [
        { label: "Option A", value: 50 },
        { label: "Option B", value: 30 },
        { label: "Option C", value: 20 },
      ],
    };
  },
};

function Card({ title, children }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      {title && (
        <h3 className="mb-2 text-sm font-medium text-gray-700">{title}</h3>
      )}
      {children}
    </div>
  );
}

export default function AdminDashboard() {
  const [surveys, setSurveys] = useState([]);
  const [selectedSurveyId, setSelectedSurveyId] = useState("");
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    api.listSurveys().then(setSurveys);
  }, []);

  useEffect(() => {
    if (!selectedSurveyId) return;
    api.getSurveySummary(selectedSurveyId).then(setSummary);
  }, [selectedSurveyId]);

  const pieColors = useMemo(() => ["#4B5563", "#6B7280", "#9CA3AF"], []);

  return (
    <div className="p-4 space-y-6 bg-gray-50 min-h-screen">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">Survey statistics overview</p>
        </div>
        <select
          value={selectedSurveyId}
          onChange={(e) => setSelectedSurveyId(Number(e.target.value))}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="">Select survey</option>
          {surveys.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}
            </option>
          ))}
        </select>
      </header>

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card title="Total Responses">{summary.totalResponses}</Card>
          <Card title="Average Rating">{summary.averageRating}</Card>
          <Card title="Number of Surveys">{surveys.length}</Card>
        </div>
      )}

      {summary && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card title="Responses Over Time">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={summary.responsesOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#4B5563" />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Rating Distribution">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={summary.ratingDistribution}
                  dataKey="value"
                  nameKey="rating"
                  outerRadius={80}
                >
                  {summary.ratingDistribution.map((_, i) => (
                    <Cell key={i} fill={pieColors[i % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}
    </div>
  );
}
