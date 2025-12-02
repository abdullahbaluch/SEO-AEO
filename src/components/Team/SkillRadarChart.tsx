import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export default function SkillRadarChart({ skills, memberName }: { skills: any; memberName: string }) {
  const skillData = [
    {
      subject: 'Content',
      value: skills?.content_creation || 0,
      fullMark: 10,
    },
    {
      subject: 'Social Media',
      value: skills?.social_media || 0,
      fullMark: 10,
    },
    {
      subject: 'SEO',
      value: skills?.seo || 0,
      fullMark: 10,
    },
    {
      subject: 'PPC',
      value: skills?.ppc_advertising || 0,
      fullMark: 10,
    },
    {
      subject: 'Design',
      value: skills?.design || 0,
      fullMark: 10,
    },
    {
      subject: 'Copy',
      value: skills?.copywriting || 0,
      fullMark: 10,
    },
    {
      subject: 'Analytics',
      value: skills?.analytics || 0,
      fullMark: 10,
    },
    {
      subject: 'Strategy',
      value: skills?.strategy || 0,
      fullMark: 10,
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={250}>
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillData}>
        <PolarGrid stroke="#e5e7eb" />
        <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 11 }} />
        <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fill: '#6b7280', fontSize: 10 }} />
        <Radar
          name={memberName || "Skills"}
          dataKey="value"
          stroke="#1f2937"
          fill="#1f2937"
          fillOpacity={0.3}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
            color: '#1f2937',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
          }}
          labelStyle={{ fontWeight: 'bold', color: '#374151' }}
          itemStyle={{ color: '#1f2937' }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}