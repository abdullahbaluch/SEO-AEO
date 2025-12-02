import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from 'recharts';

// Radar chart for score overview
export function ScoreRadarChart({ scores }) {
  const data = [
    { subject: 'Metadata', score: scores.metadata || 0 },
    { subject: 'Schema', score: scores.schema || 0 },
    { subject: 'Content', score: scores.content || 0 },
    { subject: 'Links', score: scores.links || 0 },
    { subject: 'Images', score: scores.images || 0 },
    { subject: 'A11y', score: scores.accessibility || 0 },
    { subject: 'Perf', score: scores.performance || 0 },
    { subject: 'AEO', score: scores.aeo || 0 },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Score Overview</h3>
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={data}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#6b7280' }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
          <Radar
            name="Score"
            dataKey="score"
            stroke="#1f2937"
            fill="#1f2937"
            fillOpacity={0.3}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Issue distribution pie chart
export function IssuePieChart({ issues }) {
  const severityCounts = {
    critical: issues.filter(i => i.severity === 'critical').length,
    warning: issues.filter(i => i.severity === 'warning').length,
    info: issues.filter(i => i.severity === 'info').length,
    opportunity: issues.filter(i => i.severity === 'opportunity').length,
  };

  const data = [
    { name: 'Critical', value: severityCounts.critical, color: '#ef4444' },
    { name: 'Warning', value: severityCounts.warning, color: '#f59e0b' },
    { name: 'Info', value: severityCounts.info, color: '#3b82f6' },
    { name: 'Opportunity', value: severityCounts.opportunity, color: '#10b981' },
  ].filter(d => d.value > 0);

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Issue Distribution</h3>
        <div className="h-[200px] flex items-center justify-center text-gray-400">
          No issues found
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Issue Distribution</h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => <span className="text-xs text-gray-600">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// Issues by category bar chart
export function CategoryBarChart({ issues }) {
  const categories = {};
  issues.forEach(issue => {
    if (!categories[issue.category]) {
      categories[issue.category] = { critical: 0, warning: 0, info: 0 };
    }
    if (issue.severity === 'critical') categories[issue.category].critical++;
    else if (issue.severity === 'warning') categories[issue.category].warning++;
    else categories[issue.category].info++;
  });

  const data = Object.entries(categories).map(([name, counts]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    ...counts,
  }));

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Issues by Category</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis type="number" tick={{ fontSize: 11 }} />
          <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={80} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
          />
          <Bar dataKey="critical" stackId="a" fill="#ef4444" name="Critical" />
          <Bar dataKey="warning" stackId="a" fill="#f59e0b" name="Warning" />
          <Bar dataKey="info" stackId="a" fill="#3b82f6" name="Info" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Keyword density chart
export function KeywordChart({ keywords }) {
  const data = (keywords || []).slice(0, 10).map(kw => ({
    name: kw.word,
    count: kw.count,
    density: parseFloat(kw.density),
  }));

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Top Keywords</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 10 }} 
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
            formatter={(value, name) => [
              name === 'density' ? `${value}%` : value,
              name === 'density' ? 'Density' : 'Count'
            ]}
          />
          <Bar dataKey="count" fill="#1f2937" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Score comparison chart (for diff view)
export function ScoreComparisonChart({ oldScores, newScores }) {
  const categories = ['metadata', 'schema', 'content', 'links', 'images', 'accessibility', 'performance', 'aeo'];
  
  const data = categories.map(cat => ({
    name: cat.charAt(0).toUpperCase() + cat.slice(1),
    previous: oldScores?.[cat] || 0,
    current: newScores?.[cat] || 0,
  }));

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Score Comparison</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Bar dataKey="previous" fill="#94a3b8" name="Previous" radius={[4, 4, 0, 0]} />
          <Bar dataKey="current" fill="#1f2937" name="Current" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Content metrics display
export function ContentMetrics({ metrics }) {
  const data = [
    { label: 'Words', value: metrics?.wordCount || 0, icon: '📝' },
    { label: 'Sentences', value: metrics?.sentenceCount || 0, icon: '📄' },
    { label: 'Paragraphs', value: metrics?.paragraphCount || 0, icon: '📑' },
    { label: 'Avg Words/Sentence', value: metrics?.avgWordsPerSentence || 0, icon: '📊' },
    { label: 'Reading Time', value: `${metrics?.readingTime || 0} min`, icon: '⏱️' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Content Metrics</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {data.map((item, i) => (
          <div key={i} className="text-center">
            <div className="text-2xl mb-1">{item.icon}</div>
            <div className="text-xl font-bold text-gray-900">{item.value}</div>
            <div className="text-xs text-gray-500">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}