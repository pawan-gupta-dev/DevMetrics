import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Thresholds
const THRESHOLDS = {
  leadTime: { good: 2, warn: 5 }, // days
  cycleTime: { good: 3, warn: 7 }, // days
  bugRate: { good: 10, warn: 20 }, // percentage
  deploymentFrequency: { warn: 4, good: 8 }, // count (inverted - lower is bad)
  prThroughput: { warn: 5, good: 10 }, // count (inverted - lower is bad)
};

function getStatus(metric, value) {
  switch (metric) {
    case 'leadTime':
      if (value <= THRESHOLDS.leadTime.good) return 'good';
      if (value <= THRESHOLDS.leadTime.warn) return 'warn';
      return 'bad';
    case 'cycleTime':
      if (value <= THRESHOLDS.cycleTime.good) return 'good';
      if (value <= THRESHOLDS.cycleTime.warn) return 'warn';
      return 'bad';
    case 'bugRate':
      if (value < THRESHOLDS.bugRate.good) return 'good';
      if (value < THRESHOLDS.bugRate.warn) return 'warn';
      return 'bad';
    case 'deploymentFrequency':
      if (value > THRESHOLDS.deploymentFrequency.good) return 'good';
      if (value >= THRESHOLDS.deploymentFrequency.warn) return 'warn';
      return 'bad';
    case 'prThroughput':
      if (value > THRESHOLDS.prThroughput.good) return 'good';
      if (value >= THRESHOLDS.prThroughput.warn) return 'warn';
      return 'bad';
    default:
      return 'warn';
  }
}

function getStatusBadge(status) {
  switch (status) {
    case 'good':
      return 'badge-good';
    case 'warn':
      return 'badge-warn';
    case 'bad':
      return 'badge-bad';
    default:
      return 'badge-warn';
  }
}

function getStatusLabel(status) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function MetricCard({ value, label, status, unit = '' }) {
  return (
    <div className="metric-card">
      <div className={`metric-value status-${status}`}>
        {value}
        {unit && <span className="text-lg">{unit}</span>}
      </div>
      <div className="metric-label">{label}</div>
      <div className="mt-3">
        <span className={getStatusBadge(status)}>{getStatusLabel(status)}</span>
      </div>
    </div>
  );
}

function ICDashboard({ developerId = 1 }) {
  const [profile, setProfile] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, metricsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/developer/${developerId}/profile`),
          axios.get(`${API_BASE_URL}/developer/${developerId}/metrics`),
        ]);
        setProfile(profileRes.data);
        setMetrics(metricsRes.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [developerId]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen text-red-500">Error: {error}</div>;
  }

  if (!profile || !metrics) {
    return <div className="flex items-center justify-center h-screen">No data available</div>;
  }

  // Calculate statuses
  const statuses = {
    leadTime: getStatus('leadTime', metrics.leadTime),
    cycleTime: getStatus('cycleTime', metrics.cycleTime),
    bugRate: getStatus('bugRate', metrics.bugRate),
    deploymentFrequency: getStatus('deploymentFrequency', metrics.deploymentFrequency),
    prThroughput: getStatus('prThroughput', metrics.prThroughput),
  };

  // Generate AI-style story
  const generateStory = () => {
    const parts = [];
    
    if (statuses.cycleTime === 'good') {
      parts.push('Your cycle time is impressive');
    } else if (statuses.cycleTime === 'warn') {
      parts.push('Your cycle time is moderate');
    } else {
      parts.push('Your cycle time needs improvement');
    }

    if (statuses.deploymentFrequency === 'good') {
      parts.push('and deployment frequency is strong');
    } else if (statuses.deploymentFrequency === 'warn') {
      parts.push('and deployment frequency is acceptable');
    } else {
      parts.push('and deployment frequency is limited');
    }

    if (statuses.leadTime === 'good') {
      parts.push('with fast lead times suggesting a streamlined workflow');
    } else if (statuses.leadTime === 'warn') {
      parts.push('but lead times suggest some review bottlenecks may exist');
    } else {
      parts.push('and lead times indicate significant review delays');
    }

    return parts.join(', ') + '.';
  };

  // Generate next steps
  const generateNextSteps = () => {
    const steps = [];

    if (statuses.leadTime === 'warn' || statuses.leadTime === 'bad') {
      steps.push('• Optimize PR review process: set SLA for code reviews to reduce lead time');
    }

    if (statuses.cycleTime === 'warn' || statuses.cycleTime === 'bad') {
      steps.push('• Break down larger issues into smaller tasks to improve cycle time');
    }

    if (statuses.bugRate === 'warn' || statuses.bugRate === 'bad') {
      steps.push('• Increase test coverage and implement automated QA checks');
    }

    if (statuses.deploymentFrequency === 'warn' || statuses.deploymentFrequency === 'bad') {
      steps.push('• Aim for smaller, more frequent deployments to reduce risk');
    }

    if (statuses.prThroughput === 'warn' || statuses.prThroughput === 'bad') {
      steps.push('• Prioritize PR reviews to increase throughput');
    }

    return steps.length > 0 ? steps.slice(0, 2) : ['• Maintain current practices', '• Continue monitoring metrics'];
  };

  // Data for radar chart
  const radarData = [
    { metric: 'Cycle Time', value: Math.min((1 - Math.min(metrics.cycleTime / 10, 1)) * 100, 100) },
    { metric: 'Lead Time', value: Math.min((1 - Math.min(metrics.leadTime / 10, 1)) * 100, 100) },
    { metric: 'Deployments', value: Math.min(metrics.deploymentFrequency * 12.5, 100) },
    { metric: 'PR Throughput', value: Math.min(metrics.prThroughput * 10, 100) },
    { metric: 'Quality', value: Math.min(Math.max(100 - metrics.bugRate * 5, 0), 100) },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-5xl font-bold mb-2">{profile.name}</h1>
        <p className="text-xl text-gray-400">{profile.role} • {profile.team}</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
        <MetricCard
          value={metrics.leadTime}
          label="Lead Time for Changes"
          status={statuses.leadTime}
          unit=" days"
        />
        <MetricCard
          value={metrics.cycleTime}
          label="Cycle Time"
          status={statuses.cycleTime}
          unit=" days"
        />
        <MetricCard
          value={metrics.bugRate}
          label="Bug Rate"
          status={statuses.bugRate}
          unit="%"
        />
        <MetricCard
          value={metrics.deploymentFrequency}
          label="Deployment Frequency"
          status={statuses.deploymentFrequency}
        />
        <MetricCard
          value={metrics.prThroughput}
          label="PR Throughput"
          status={statuses.prThroughput}
        />
      </div>

      {/* Chart */}
      <div className="bg-gray-800 rounded-lg p-8 shadow-lg border border-gray-700 mb-12">
        <h2 className="text-2xl font-bold mb-6">Performance Overview</h2>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#374151" />
            <PolarAngleAxis dataKey="metric" stroke="#9ca3af" />
            <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#9ca3af" />
            <Radar name="Performance" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Story Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-800 rounded-lg p-8 shadow-lg border border-gray-700">
          <h2 className="text-2xl font-bold mb-4">Your Story</h2>
          <p className="text-gray-300 leading-relaxed">
            {generateStory()}
          </p>
        </div>

        {/* Next Steps Section */}
        <div className="bg-gray-800 rounded-lg p-8 shadow-lg border border-gray-700">
          <h2 className="text-2xl font-bold mb-4">Next Steps</h2>
          <ul className="space-y-3">
            {generateNextSteps().map((step, idx) => (
              <li key={idx} className="text-gray-300 leading-relaxed">
                {step}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ICDashboard;
