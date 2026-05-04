import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const THRESHOLDS = {
  leadTime: { good: 2, warn: 5 },
  cycleTime: { good: 3, warn: 7 },
  bugRate: { good: 10, warn: 20 },
  deploymentFrequency: { warn: 4, good: 8 },
  prThroughput: { warn: 5, good: 10 },
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

function getStatusColor(status) {
  switch (status) {
    case 'good':
      return 'text-good';
    case 'warn':
      return 'text-warn';
    case 'bad':
      return 'text-bad';
    default:
      return 'text-gray-400';
  }
}

function getCellBgColor(status) {
  switch (status) {
    case 'good':
      return 'bg-good/10';
    case 'warn':
      return 'bg-warn/10';
    case 'bad':
      return 'bg-bad/10';
    default:
      return 'bg-gray-700';
  }
}

function ManagerSummary() {
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/developers/all/metrics`);
        setDevelopers(res.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen text-red-500">Error: {error}</div>;
  }

  if (developers.length === 0) {
    return <div className="flex items-center justify-center h-screen">No developers found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-5xl font-bold mb-2">Team Performance Overview</h1>
        <p className="text-xl text-gray-400">Summary of all developers' metrics</p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-gray-800 rounded-lg shadow-lg border border-gray-700">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700 bg-gray-900">
              <th className="px-6 py-4 text-left text-sm font-semibold">Developer</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Role</th>
              <th className="px-6 py-4 text-center text-sm font-semibold">Lead Time</th>
              <th className="px-6 py-4 text-center text-sm font-semibold">Cycle Time</th>
              <th className="px-6 py-4 text-center text-sm font-semibold">Bug Rate</th>
              <th className="px-6 py-4 text-center text-sm font-semibold">Deploy Freq</th>
              <th className="px-6 py-4 text-center text-sm font-semibold">PR Throughput</th>
            </tr>
          </thead>
          <tbody>
            {developers.map((dev) => {
              const leadTimeStatus = getStatus('leadTime', dev.leadTime);
              const cycleTimeStatus = getStatus('cycleTime', dev.cycleTime);
              const bugRateStatus = getStatus('bugRate', dev.bugRate);
              const deployFreqStatus = getStatus('deploymentFrequency', dev.deploymentFrequency);
              const prThroughputStatus = getStatus('prThroughput', dev.prThroughput);

              return (
                <tr key={dev.id} className="border-b border-gray-700 hover:bg-gray-750">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium">{dev.name}</p>
                      <p className="text-sm text-gray-400">{dev.team}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">{dev.role}</td>
                  <td className={`px-6 py-4 text-center font-medium ${getCellBgColor(leadTimeStatus)}`}>
                    <span className={getStatusColor(leadTimeStatus)}>
                      {dev.leadTime} days
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-center font-medium ${getCellBgColor(cycleTimeStatus)}`}>
                    <span className={getStatusColor(cycleTimeStatus)}>
                      {dev.cycleTime} days
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-center font-medium ${getCellBgColor(bugRateStatus)}`}>
                    <span className={getStatusColor(bugRateStatus)}>
                      {dev.bugRate}%
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-center font-medium ${getCellBgColor(deployFreqStatus)}`}>
                    <span className={getStatusColor(deployFreqStatus)}>
                      {dev.deploymentFrequency}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-center font-medium ${getCellBgColor(prThroughputStatus)}`}>
                    <span className={getStatusColor(prThroughputStatus)}>
                      {dev.prThroughput}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-8 flex gap-8">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-good/20 border border-good rounded"></div>
          <span className="text-sm text-gray-400">Good Performance</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-warn/20 border border-warn rounded"></div>
          <span className="text-sm text-gray-400">Warning</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-bad/20 border border-bad rounded"></div>
          <span className="text-sm text-gray-400">Needs Improvement</span>
        </div>
      </div>
    </div>
  );
}

export default ManagerSummary;
