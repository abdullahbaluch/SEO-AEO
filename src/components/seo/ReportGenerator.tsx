import React from 'react';

// Report Generator - Export scan results in various formats
export const ReportGenerator = {
  // Generate JSON report
  generateJSON: (scanData) => {
    const report = {
      generatedAt: new Date().toISOString(),
      url: scanData.url,
      title: scanData.metadata?.title,
      summary: {
        overallScore: scanData.scores?.overall || 0,
        seoScore: scanData.scores?.seo || 0,
        aeoScore: scanData.scores?.aeo || 0,
        issuesCount: scanData.issues?.length || 0,
        criticalCount: scanData.issues?.filter(i => i.severity === 'critical').length || 0,
        warningsCount: scanData.issues?.filter(i => i.severity === 'warning').length || 0,
      },
      scores: scanData.scores,
      metadata: scanData.metadata,
      openGraph: scanData.og,
      twitterCard: scanData.twitter,
      headings: scanData.headings,
      schemas: scanData.schemas,
      keywords: scanData.keywords,
      contentMetrics: scanData.contentMetrics,
      links: {
        total: scanData.links?.length || 0,
        internal: scanData.links?.filter(l => l.isInternal).length || 0,
        external: scanData.links?.filter(l => !l.isInternal).length || 0,
      },
      images: {
        total: scanData.images?.length || 0,
        withAlt: scanData.images?.filter(i => i.hasAlt && !i.altEmpty).length || 0,
        withoutAlt: scanData.images?.filter(i => !i.hasAlt || i.altEmpty).length || 0,
      },
      issues: scanData.issues,
      recommendations: scanData.schemaSuggestions,
    };

    return JSON.stringify(report, null, 2);
  },

  // Generate HTML report
  generateHTML: (scanData) => {
    const scores = scanData.scores || {};
    const issues = scanData.issues || [];
    
    const criticalIssues = issues.filter(i => i.severity === 'critical');
    const warnings = issues.filter(i => i.severity === 'warning');
    const opportunities = issues.filter(i => i.severity === 'opportunity' || i.severity === 'info');

    const getScoreColor = (score) => {
      if (score >= 80) return '#10b981';
      if (score >= 60) return '#f59e0b';
      return '#ef4444';
    };

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SEO Report - ${scanData.metadata?.title || scanData.url}</title>
  <style>
    :root {
      --primary: #6366f1;
      --success: #10b981;
      --warning: #f59e0b;
      --danger: #ef4444;
      --gray-50: #f9fafb;
      --gray-100: #f3f4f6;
      --gray-200: #e5e7eb;
      --gray-600: #4b5563;
      --gray-800: #1f2937;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: var(--gray-800);
      background: var(--gray-50);
    }
    .container { max-width: 1000px; margin: 0 auto; padding: 2rem; }
    .header { text-align: center; margin-bottom: 3rem; }
    .header h1 { font-size: 2rem; color: var(--primary); margin-bottom: 0.5rem; }
    .header p { color: var(--gray-600); }
    .url { font-size: 0.875rem; word-break: break-all; color: var(--gray-600); margin-top: 1rem; }
    .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
    .score-card { 
      background: white; 
      border-radius: 12px; 
      padding: 1.5rem; 
      text-align: center;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .score-card h3 { font-size: 0.875rem; color: var(--gray-600); margin-bottom: 0.5rem; }
    .score-card .score { font-size: 2rem; font-weight: 700; }
    .section { background: white; border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .section h2 { font-size: 1.25rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
    .issue { padding: 1rem; border-radius: 8px; margin-bottom: 0.75rem; }
    .issue.critical { background: #fef2f2; border-left: 4px solid var(--danger); }
    .issue.warning { background: #fffbeb; border-left: 4px solid var(--warning); }
    .issue.info, .issue.opportunity { background: #eff6ff; border-left: 4px solid #3b82f6; }
    .issue h4 { font-size: 0.875rem; margin-bottom: 0.25rem; }
    .issue p { font-size: 0.8125rem; color: var(--gray-600); }
    .issue .fix { margin-top: 0.5rem; padding: 0.5rem; background: white; border-radius: 4px; font-size: 0.75rem; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 0.75rem; text-align: left; border-bottom: 1px solid var(--gray-200); }
    th { background: var(--gray-50); font-weight: 600; font-size: 0.75rem; text-transform: uppercase; }
    td { font-size: 0.875rem; }
    .badge { display: inline-block; padding: 0.25rem 0.5rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 500; }
    .badge.good { background: #d1fae5; color: #065f46; }
    .badge.bad { background: #fee2e2; color: #991b1b; }
    .footer { text-align: center; margin-top: 3rem; padding-top: 2rem; border-top: 1px solid var(--gray-200); color: var(--gray-600); font-size: 0.875rem; }
    @media print { body { background: white; } .container { padding: 1rem; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>SEO Analysis Report</h1>
      <p>Generated on ${new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}</p>
      <div class="url">${scanData.url}</div>
    </div>

    <div class="summary">
      <div class="score-card">
        <h3>Overall Score</h3>
        <div class="score" style="color: ${getScoreColor(scores.overall || 0)}">${scores.overall || 0}</div>
      </div>
      <div class="score-card">
        <h3>SEO Score</h3>
        <div class="score" style="color: ${getScoreColor(scores.seo || 0)}">${scores.seo || 0}</div>
      </div>
      <div class="score-card">
        <h3>AEO Score</h3>
        <div class="score" style="color: ${getScoreColor(scores.aeo || 0)}">${scores.aeo || 0}</div>
      </div>
      <div class="score-card">
        <h3>Issues Found</h3>
        <div class="score" style="color: var(--gray-800)">${issues.length}</div>
      </div>
    </div>

    ${criticalIssues.length > 0 ? `
    <div class="section">
      <h2>🔴 Critical Issues (${criticalIssues.length})</h2>
      ${criticalIssues.map(issue => `
        <div class="issue critical">
          <h4>${issue.title}</h4>
          <p>${issue.description}</p>
          ${issue.fix ? `<div class="fix"><strong>Fix:</strong> ${issue.fix}</div>` : ''}
        </div>
      `).join('')}
    </div>
    ` : ''}

    ${warnings.length > 0 ? `
    <div class="section">
      <h2>🟡 Warnings (${warnings.length})</h2>
      ${warnings.map(issue => `
        <div class="issue warning">
          <h4>${issue.title}</h4>
          <p>${issue.description}</p>
          ${issue.fix ? `<div class="fix"><strong>Fix:</strong> ${issue.fix}</div>` : ''}
        </div>
      `).join('')}
    </div>
    ` : ''}

    ${opportunities.length > 0 ? `
    <div class="section">
      <h2>💡 Opportunities (${opportunities.length})</h2>
      ${opportunities.map(issue => `
        <div class="issue info">
          <h4>${issue.title}</h4>
          <p>${issue.description}</p>
          ${issue.fix ? `<div class="fix"><strong>Recommendation:</strong> ${issue.fix}</div>` : ''}
        </div>
      `).join('')}
    </div>
    ` : ''}

    <div class="section">
      <h2>📊 Score Breakdown</h2>
      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th>Score</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(scores).filter(([k]) => k !== 'overall' && k !== 'seo').map(([category, score]) => `
            <tr>
              <td style="text-transform: capitalize">${category}</td>
              <td><strong>${score}</strong>/100</td>
              <td><span class="badge ${score >= 70 ? 'good' : 'bad'}">${score >= 80 ? 'Good' : score >= 60 ? 'Needs Work' : 'Poor'}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    ${scanData.metadata ? `
    <div class="section">
      <h2>📝 Metadata</h2>
      <table>
        <tbody>
          <tr><td><strong>Title</strong></td><td>${scanData.metadata.title || 'Not set'} ${scanData.metadata.title ? `(${scanData.metadata.title.length} chars)` : ''}</td></tr>
          <tr><td><strong>Description</strong></td><td>${scanData.metadata.description || 'Not set'} ${scanData.metadata.description ? `(${scanData.metadata.description.length} chars)` : ''}</td></tr>
          <tr><td><strong>Canonical</strong></td><td>${scanData.metadata.canonical || 'Not set'}</td></tr>
          <tr><td><strong>Robots</strong></td><td>${scanData.metadata.robots || 'Not set'}</td></tr>
          <tr><td><strong>Language</strong></td><td>${scanData.metadata.language || 'Not set'}</td></tr>
        </tbody>
      </table>
    </div>
    ` : ''}

    ${scanData.headings && scanData.headings.length > 0 ? `
    <div class="section">
      <h2>📑 Heading Structure</h2>
      <table>
        <thead>
          <tr><th>Level</th><th>Text</th></tr>
        </thead>
        <tbody>
          ${scanData.headings.slice(0, 15).map(h => `
            <tr>
              <td><strong>H${h.level}</strong></td>
              <td style="padding-left: ${(h.level - 1) * 20}px">${h.text}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    ` : ''}

    ${scanData.keywords && scanData.keywords.length > 0 ? `
    <div class="section">
      <h2>🔑 Top Keywords</h2>
      <table>
        <thead>
          <tr><th>Keyword</th><th>Count</th><th>Density</th></tr>
        </thead>
        <tbody>
          ${scanData.keywords.slice(0, 10).map(kw => `
            <tr>
              <td>${kw.word}</td>
              <td>${kw.count}</td>
              <td>${kw.density}%</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    ` : ''}

    <div class="footer">
      <p>Generated by SEO Toolkit</p>
    </div>
  </div>
</body>
</html>`;
  },

  // Generate CSV export of issues
  generateIssuesCSV: (issues) => {
    const headers = ['Severity', 'Category', 'Title', 'Description', 'Element', 'Current Value', 'Recommended Fix'];
    const rows = issues.map(issue => [
      issue.severity,
      issue.category,
      `"${(issue.title || '').replace(/"/g, '""')}"`,
      `"${(issue.description || '').replace(/"/g, '""')}"`,
      `"${(issue.element || '').replace(/"/g, '""')}"`,
      `"${(issue.current || '').replace(/"/g, '""')}"`,
      `"${(issue.fix || '').replace(/"/g, '""')}"`,
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  },

  // Download helper
  downloadFile: (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  // Export all formats
  exportJSON: (scanData, filename = 'seo-report.json') => {
    const content = ReportGenerator.generateJSON(scanData);
    ReportGenerator.downloadFile(content, filename, 'application/json');
  },

  exportHTML: (scanData, filename = 'seo-report.html') => {
    const content = ReportGenerator.generateHTML(scanData);
    ReportGenerator.downloadFile(content, filename, 'text/html');
  },

  exportCSV: (issues, filename = 'seo-issues.csv') => {
    const content = ReportGenerator.generateIssuesCSV(issues);
    ReportGenerator.downloadFile(content, filename, 'text/csv');
  },
};

export default ReportGenerator;