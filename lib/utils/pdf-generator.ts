/**
 * Professional PDF Report Generator
 * Generates SEO reports similar to Semrush, Ahrefs, Moz
 */

export interface PDFReportData {
  url: string;
  timestamp: string;
  overallScore: number;
  onsite?: any;
  technical?: any;
  keywords?: any;
  content?: any;
  aeo?: any;
  crawl?: any;
  allIssues?: any[];
}

/**
 * Generate professional HTML report for PDF conversion
 */
export function generatePDFHTML(data: PDFReportData): string {
  const {
    url,
    timestamp,
    overallScore,
    onsite,
    technical,
    keywords,
    content,
    aeo,
    crawl,
    allIssues = [],
  } = data;

  const date = new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>SEO Analysis Report - ${url}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      background: white;
      padding: 40px;
    }

    .header {
      text-align: center;
      margin-bottom: 50px;
      padding-bottom: 30px;
      border-bottom: 3px solid #6366f1;
    }

    .header h1 {
      font-size: 36px;
      color: #1f2937;
      margin-bottom: 10px;
    }

    .header .url {
      font-size: 18px;
      color: #6366f1;
      margin-bottom: 10px;
    }

    .header .date {
      font-size: 14px;
      color: #6b7280;
    }

    .score-card {
      background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
      color: white;
      padding: 40px;
      border-radius: 16px;
      text-align: center;
      margin-bottom: 40px;
    }

    .score-card .score {
      font-size: 72px;
      font-weight: bold;
      margin-bottom: 10px;
    }

    .score-card .label {
      font-size: 24px;
      opacity: 0.9;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 20px;
      margin-bottom: 40px;
    }

    .metric-card {
      background: #f9fafb;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      padding: 20px;
      text-align: center;
    }

    .metric-card .value {
      font-size: 32px;
      font-weight: bold;
      color: #1f2937;
      margin-bottom: 5px;
    }

    .metric-card .label {
      font-size: 14px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .section {
      margin-bottom: 40px;
      page-break-inside: avoid;
    }

    .section-title {
      font-size: 24px;
      font-weight: bold;
      color: #1f2937;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e5e7eb;
    }

    .issue-list {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .issue {
      border-left: 4px solid #6b7280;
      padding: 15px;
      background: #f9fafb;
      border-radius: 8px;
    }

    .issue.critical {
      border-left-color: #ef4444;
      background: #fef2f2;
    }

    .issue.warning {
      border-left-color: #f59e0b;
      background: #fffbeb;
    }

    .issue .title {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 8px;
      color: #1f2937;
    }

    .issue .description {
      font-size: 14px;
      color: #4b5563;
      margin-bottom: 8px;
    }

    .issue .recommendation {
      font-size: 13px;
      color: #6366f1;
      font-style: italic;
    }

    .issue .badge {
      display: inline-block;
      font-size: 11px;
      padding: 4px 8px;
      border-radius: 4px;
      background: white;
      color: #6b7280;
      margin-bottom: 8px;
    }

    .stats-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
    }

    .stats-table tr {
      border-bottom: 1px solid #e5e7eb;
    }

    .stats-table td {
      padding: 12px;
      font-size: 14px;
    }

    .stats-table td:first-child {
      color: #6b7280;
      width: 40%;
    }

    .stats-table td:last-child {
      font-weight: 600;
      text-align: right;
    }

    .keyword-list {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      margin-top: 15px;
    }

    .keyword-item {
      display: flex;
      justify-between;
      padding: 10px;
      background: #f9fafb;
      border-radius: 6px;
      font-size: 14px;
    }

    .chart-placeholder {
      background: #f3f4f6;
      border: 2px dashed #d1d5db;
      border-radius: 12px;
      padding: 40px;
      text-align: center;
      color: #9ca3af;
      margin: 20px 0;
    }

    .footer {
      margin-top: 60px;
      padding-top: 30px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      color: #9ca3af;
      font-size: 12px;
    }

    @media print {
      body {
        padding: 20px;
      }
      .section {
        page-break-after: auto;
      }
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div class="header">
    <h1>SEO Analysis Report</h1>
    <div class="url">${url}</div>
    <div class="date">Generated on ${date}</div>
  </div>

  <!-- Overall Score -->
  <div class="score-card">
    <div class="score">${overallScore}</div>
    <div class="label">Overall SEO Score</div>
  </div>

  <!-- Module Scores -->
  <div class="metrics-grid">
    ${onsite ? `
      <div class="metric-card">
        <div class="value">${onsite.score}</div>
        <div class="label">Onsite</div>
      </div>
    ` : ''}
    ${technical ? `
      <div class="metric-card">
        <div class="value">${technical.score}</div>
        <div class="label">Technical</div>
      </div>
    ` : ''}
    ${keywords ? `
      <div class="metric-card">
        <div class="value">${keywords.keywords.length}</div>
        <div class="label">Keywords</div>
      </div>
    ` : ''}
    ${content ? `
      <div class="metric-card">
        <div class="value">${content.overallScore}</div>
        <div class="label">Content</div>
      </div>
    ` : ''}
    ${aeo ? `
      <div class="metric-card">
        <div class="value">${aeo.answerability.score}</div>
        <div class="label">AEO</div>
      </div>
    ` : ''}
  </div>

  <!-- Critical Issues -->
  ${allIssues.length > 0 ? `
    <div class="section">
      <h2 class="section-title">🚨 Issues & Recommendations (${allIssues.length})</h2>
      <div class="issue-list">
        ${allIssues.slice(0, 20).map(issue => `
          <div class="issue ${issue.severity}">
            <div class="badge">${issue.module}</div>
            <div class="title">${issue.title}</div>
            <div class="description">${issue.description}</div>
            ${issue.recommendation ? `<div class="recommendation">💡 ${issue.recommendation}</div>` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  ` : ''}

  <!-- Onsite Analysis -->
  ${onsite ? `
    <div class="section">
      <h2 class="section-title">🌐 Onsite Analysis</h2>
      <table class="stats-table">
        <tr>
          <td>Word Count</td>
          <td>${onsite.content.wordCount}</td>
        </tr>
        <tr>
          <td>Reading Time</td>
          <td>${onsite.content.readingTime} minutes</td>
        </tr>
        <tr>
          <td>Readability Score</td>
          <td>${Math.round(onsite.content.readabilityScore)}</td>
        </tr>
        <tr>
          <td>Content Depth</td>
          <td>${onsite.content.contentDepth}</td>
        </tr>
        <tr>
          <td>Total Images</td>
          <td>${onsite.images.total}</td>
        </tr>
        <tr>
          <td>Alt Text Coverage</td>
          <td>${Math.round(onsite.images.altCoverage)}%</td>
        </tr>
        <tr>
          <td>Internal Links</td>
          <td>${onsite.links.internal}</td>
        </tr>
        <tr>
          <td>External Links</td>
          <td>${onsite.links.external}</td>
        </tr>
      </table>
    </div>
  ` : ''}

  <!-- Technical SEO -->
  ${technical ? `
    <div class="section">
      <h2 class="section-title">🛡️ Technical SEO</h2>
      <table class="stats-table">
        <tr>
          <td>Checks Passed</td>
          <td style="color: #10b981;">${technical.summary.passed}</td>
        </tr>
        <tr>
          <td>Warnings</td>
          <td style="color: #f59e0b;">${technical.summary.warnings}</td>
        </tr>
        <tr>
          <td>Failed Checks</td>
          <td style="color: #ef4444;">${technical.summary.failed}</td>
        </tr>
      </table>
      <div style="margin-top: 20px;">
        ${technical.checks.map(check => `
          <div class="issue ${check.status === 'fail' ? 'critical' : check.status === 'warning' ? 'warning' : ''}">
            <div class="title">${check.name}</div>
            <div class="description">${check.message}</div>
            ${check.recommendation ? `<div class="recommendation">💡 ${check.recommendation}</div>` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  ` : ''}

  <!-- Keywords -->
  ${keywords ? `
    <div class="section">
      <h2 class="section-title">🔑 Top Keywords</h2>
      <div class="keyword-list">
        ${keywords.keywords.slice(0, 20).map(kw => `
          <div class="keyword-item">
            <span>${kw.word}</span>
            <span style="font-family: monospace; color: #6b7280;">${kw.count}× (${kw.density.toFixed(1)}%)</span>
          </div>
        `).join('')}
      </div>
    </div>
  ` : ''}

  <!-- Content Quality -->
  ${content ? `
    <div class="section">
      <h2 class="section-title">📝 Content Quality</h2>
      <table class="stats-table">
        <tr>
          <td>Clarity Score</td>
          <td>${content.scores.clarity}</td>
        </tr>
        <tr>
          <td>Structure Score</td>
          <td>${content.scores.structure}</td>
        </tr>
        <tr>
          <td>Keyword Optimization</td>
          <td>${content.scores.keywordOptimization}</td>
        </tr>
        <tr>
          <td>Engagement Score</td>
          <td>${content.scores.engagement}</td>
        </tr>
        <tr>
          <td>Readability Score</td>
          <td>${content.scores.readability}</td>
        </tr>
      </table>

      ${content.recommendations.length > 0 ? `
        <h3 style="margin-top: 30px; margin-bottom: 15px; font-size: 18px;">Recommendations</h3>
        ${content.recommendations.slice(0, 10).map(rec => `
          <div class="issue ${rec.priority === 'high' ? 'critical' : 'warning'}">
            <div class="title">${rec.message}</div>
            <div class="description">${rec.actionable}</div>
          </div>
        `).join('')}
      ` : ''}
    </div>
  ` : ''}

  <!-- Website Crawl -->
  ${crawl && crawl.summary ? `
    <div class="section">
      <h2 class="section-title">🔍 Website Crawl Summary</h2>
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="value">${crawl.summary.totalPages}</div>
          <div class="label">Total Pages</div>
        </div>
        <div class="metric-card">
          <div class="value" style="color: #10b981;">${crawl.summary.successfulPages}</div>
          <div class="label">Successful</div>
        </div>
        <div class="metric-card">
          <div class="value" style="color: #ef4444;">${crawl.summary.totalBrokenLinks}</div>
          <div class="label">Broken Links</div>
        </div>
        <div class="metric-card">
          <div class="value">${Math.round(crawl.summary.avgLoadTime)}ms</div>
          <div class="label">Avg Load Time</div>
        </div>
      </div>
    </div>
  ` : ''}

  <!-- Footer -->
  <div class="footer">
    <p>Generated by SEO Toolkit | Professional SEO Analysis Platform</p>
    <p>Report generated on ${date}</p>
  </div>
</body>
</html>
  `;
}

/**
 * Download HTML as PDF (client-side)
 */
export function downloadPDF(data: PDFReportData) {
  const html = generatePDFHTML(data);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `seo-report-${new URL(data.url).hostname}-${Date.now()}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  // Open in new window for printing to PDF
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }
}

/**
 * Download data as JSON
 */
export function downloadJSON(data: any) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `seo-report-${new URL(data.url).hostname}-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
