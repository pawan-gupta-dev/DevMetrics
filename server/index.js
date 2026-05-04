import express from 'express';
import cors from 'cors';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Load mock data
const mockData = JSON.parse(fs.readFileSync(`${__dirname}/data/mock.json`, 'utf8'));

// Helper function to calculate days between two dates
function daysBetween(date1, date2) {
  if (!date1 || !date2) return 0;
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2 - d1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Helper function to get current month's data
function isCurrentMonth(dateString) {
  if (!dateString) return false;
  const date = new Date(dateString);
  const now = new Date();
  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
}

// Helper function to get last 30 days
function isInLast30Days(dateString) {
  if (!dateString) return false;
  const date = new Date(dateString);
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  return date >= thirtyDaysAgo && date <= now;
}

// GET /api/developer/:id/profile
app.get('/api/developer/:id/profile', (req, res) => {
  const { id } = req.params;
  const developer = mockData.developers.find(d => d.id === parseInt(id));

  if (!developer) {
    return res.status(404).json({ error: 'Developer not found' });
  }

  res.json({
    id: developer.id,
    name: developer.name,
    role: developer.role,
    team: developer.team
  });
});

// GET /api/developer/:id/metrics
app.get('/api/developer/:id/metrics', (req, res) => {
  const { id } = req.params;
  const devId = parseInt(id);

  const developer = mockData.developers.find(d => d.id === devId);
  if (!developer) {
    return res.status(404).json({ error: 'Developer not found' });
  }

  // Get developer's issues
  const devIssues = mockData.issues.filter(i => i.dev_id === devId);
  
  // Get completed issues
  const completedIssues = devIssues.filter(i => i.status === 'Done' && i.done_at);
  
  // Get current month's issues
  const currentMonthIssues = completedIssues.filter(i => isCurrentMonth(i.done_at));

  // Get developer's PRs
  const devPRs = mockData.pull_requests.filter(pr => pr.dev_id === devId);
  
  // Get merged PRs
  const mergedPRs = devPRs.filter(pr => pr.status === 'merged' && pr.merged_at);
  
  // Get current month's merged PRs
  const currentMonthPRs = mergedPRs.filter(pr => isCurrentMonth(pr.merged_at));

  // Get deployments for developer's PRs
  const devDeployments = mockData.deployments.filter(dep => 
    mergedPRs.some(pr => pr.id === dep.pr_id)
  );

  // Get developer's bugs
  const devBugs = mockData.bugs.filter(b => b.dev_id === devId);
  
  // Get current month's bugs
  const currentMonthBugs = devBugs.filter(b => isCurrentMonth(b.found_at));

  // 1. Lead Time for Changes (avg time from PR opened to production deploy)
  const leadTimes = devDeployments
    .map(dep => {
      const pr = mergedPRs.find(p => p.id === dep.pr_id);
      if (pr && pr.opened_at && dep.deployed_at) {
        return daysBetween(pr.opened_at, dep.deployed_at);
      }
      return 0;
    })
    .filter(t => t > 0);
  
  const leadTime = leadTimes.length > 0 ? Math.round(leadTimes.reduce((a, b) => a + b) / leadTimes.length * 100) / 100 : 0;

  // 2. Cycle Time (avg time from issue "In Progress" to "Done")
  const cycleTimes = completedIssues
    .map(issue => daysBetween(issue.in_progress_at, issue.done_at))
    .filter(t => t > 0);
  
  const cycleTime = cycleTimes.length > 0 ? Math.round(cycleTimes.reduce((a, b) => a + b) / cycleTimes.length * 100) / 100 : 0;

  // 3. Bug Rate (escaped bugs / issues completed this month)
  const bugRate = currentMonthIssues.length > 0 
    ? Math.round((currentMonthBugs.length / currentMonthIssues.length) * 10000) / 100 
    : 0;

  // 4. Deployment Frequency (successful prod deployments this month)
  const successfulDeployments = devDeployments.filter(d => d.status === 'success' && isCurrentMonth(d.deployed_at));
  const deploymentFrequency = successfulDeployments.length;

  // 5. PR Throughput (merged PRs this month)
  const prThroughput = currentMonthPRs.length;

  res.json({
    leadTime: leadTime,
    cycleTime: cycleTime,
    bugRate: bugRate,
    deploymentFrequency: deploymentFrequency,
    prThroughput: prThroughput
  });
});

// GET /api/developers/all/metrics (for manager summary)
app.get('/api/developers/all/metrics', (req, res) => {
  const result = mockData.developers.map(dev => {
    const devId = dev.id;

    // Get developer's issues
    const devIssues = mockData.issues.filter(i => i.dev_id === devId);
    const completedIssues = devIssues.filter(i => i.status === 'Done' && i.done_at);
    const currentMonthIssues = completedIssues.filter(i => isCurrentMonth(i.done_at));

    // Get developer's PRs
    const devPRs = mockData.pull_requests.filter(pr => pr.dev_id === devId);
    const mergedPRs = devPRs.filter(pr => pr.status === 'merged' && pr.merged_at);
    const currentMonthPRs = mergedPRs.filter(pr => isCurrentMonth(pr.merged_at));

    // Get deployments for developer's PRs
    const devDeployments = mockData.deployments.filter(dep => 
      mergedPRs.some(pr => pr.id === dep.pr_id)
    );

    // Get developer's bugs
    const devBugs = mockData.bugs.filter(b => b.dev_id === devId);
    const currentMonthBugs = devBugs.filter(b => isCurrentMonth(b.found_at));

    // Calculate metrics
    const leadTimes = devDeployments
      .map(dep => {
        const pr = mergedPRs.find(p => p.id === dep.pr_id);
        if (pr && pr.opened_at && dep.deployed_at) {
          return daysBetween(pr.opened_at, dep.deployed_at);
        }
        return 0;
      })
      .filter(t => t > 0);
    
    const leadTime = leadTimes.length > 0 ? Math.round(leadTimes.reduce((a, b) => a + b) / leadTimes.length * 100) / 100 : 0;

    const cycleTimes = completedIssues
      .map(issue => daysBetween(issue.in_progress_at, issue.done_at))
      .filter(t => t > 0);
    
    const cycleTime = cycleTimes.length > 0 ? Math.round(cycleTimes.reduce((a, b) => a + b) / cycleTimes.length * 100) / 100 : 0;

    const bugRate = currentMonthIssues.length > 0 
      ? Math.round((currentMonthBugs.length / currentMonthIssues.length) * 10000) / 100 
      : 0;

    const successfulDeployments = devDeployments.filter(d => d.status === 'success' && isCurrentMonth(d.deployed_at));
    const deploymentFrequency = successfulDeployments.length;

    const prThroughput = currentMonthPRs.length;

    return {
      id: dev.id,
      name: dev.name,
      role: dev.role,
      team: dev.team,
      leadTime,
      cycleTime,
      bugRate,
      deploymentFrequency,
      prThroughput
    };
  });

  res.json(result);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
