/**
 * Export Utilities
 * Provides CSV and JSON export functionality for SEO reports
 */

import { Parser } from 'json2csv';

export interface ExportableData {
  [key: string]: any;
}

/**
 * Convert data to CSV format
 */
export function convertToCSV(data: ExportableData[] | ExportableData): string {
  // Ensure we have an array
  const dataArray = Array.isArray(data) ? data : [data];

  if (dataArray.length === 0) {
    return '';
  }

  try {
    // Flatten nested objects
    const flattenedData = dataArray.map(item => flattenObject(item));

    // Use json2csv library
    const parser = new Parser({
      flatten: true,
      unwind: [], // Don't unwind arrays
    });

    return parser.parse(flattenedData);
  } catch (error) {
    console.error('CSV conversion error:', error);

    // Fallback: simple CSV generation
    return generateSimpleCSV(dataArray);
  }
}

/**
 * Flatten nested object for CSV export
 */
function flattenObject(obj: any, prefix = ''): any {
  const flattened: any = {};

  Object.keys(obj).forEach(key => {
    const value = obj[key];
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (value === null || value === undefined) {
      flattened[newKey] = '';
    } else if (Array.isArray(value)) {
      // Convert arrays to comma-separated strings
      flattened[newKey] = value.join(', ');
    } else if (typeof value === 'object' && !(value instanceof Date)) {
      // Recursively flatten nested objects
      Object.assign(flattened, flattenObject(value, newKey));
    } else {
      flattened[newKey] = value;
    }
  });

  return flattened;
}

/**
 * Simple CSV generation fallback
 */
function generateSimpleCSV(data: ExportableData[]): string {
  if (data.length === 0) return '';

  // Get all unique keys
  const keys = Array.from(
    new Set(data.flatMap(item => Object.keys(flattenObject(item))))
  );

  // Create header row
  const header = keys.map(escapeCSVValue).join(',');

  // Create data rows
  const rows = data.map(item => {
    const flattened = flattenObject(item);
    return keys.map(key => escapeCSVValue(flattened[key] ?? '')).join(',');
  });

  return [header, ...rows].join('\n');
}

/**
 * Escape CSV values
 */
function escapeCSVValue(value: any): string {
  if (value === null || value === undefined) return '';

  const stringValue = String(value);

  // If contains comma, newline, or quote, wrap in quotes and escape quotes
  if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

/**
 * Download CSV file
 */
export function downloadCSV(data: ExportableData[] | ExportableData, filename: string) {
  const csv = convertToCSV(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

/**
 * Download JSON file
 */
export function downloadJSONFile(data: any, filename: string) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

/**
 * Convert SEO report data to tabular format for CSV
 */
export function convertSEOReportToCSV(reportData: any): string {
  const tables: string[] = [];

  // Overview table
  if (reportData.url) {
    tables.push('=== OVERVIEW ===');
    tables.push(convertToCSV([
      {
        URL: reportData.url,
        'Overall Score': reportData.overallScore || 'N/A',
        'Analysis Date': reportData.timestamp || new Date().toISOString(),
        'Processing Time (ms)': reportData.processingTime || 'N/A',
      },
    ]));
    tables.push('');
  }

  // Module scores
  const moduleScores = [];
  if (reportData.onsite?.score !== undefined) moduleScores.push({ Module: 'On-Page SEO', Score: reportData.onsite.score });
  if (reportData.technical?.score !== undefined) moduleScores.push({ Module: 'Technical SEO', Score: reportData.technical.score });
  if (reportData.keywords) moduleScores.push({ Module: 'Keywords', 'Total Keywords': reportData.keywords.keywords?.length || 0 });
  if (reportData.content?.score !== undefined) moduleScores.push({ Module: 'Content Quality', Score: reportData.content.score });
  if (reportData.aeo?.score !== undefined) moduleScores.push({ Module: 'AEO', Score: reportData.aeo.score });

  if (moduleScores.length > 0) {
    tables.push('=== MODULE SCORES ===');
    tables.push(convertToCSV(moduleScores));
    tables.push('');
  }

  // Issues
  if (reportData.allIssues && reportData.allIssues.length > 0) {
    tables.push('=== ISSUES FOUND ===');
    tables.push(convertToCSV(reportData.allIssues));
    tables.push('');
  }

  // Keywords
  if (reportData.keywords?.keywords && reportData.keywords.keywords.length > 0) {
    tables.push('=== TOP KEYWORDS ===');
    tables.push(convertToCSV(reportData.keywords.keywords.slice(0, 20)));
    tables.push('');
  }

  // On-page metrics
  if (reportData.onsite) {
    const onsiteData = [];
    if (reportData.onsite.metadata) {
      onsiteData.push({
        Metric: 'Title',
        Value: reportData.onsite.metadata.title || 'Missing',
        'Char Count': reportData.onsite.metadata.title?.length || 0,
      });
      onsiteData.push({
        Metric: 'Description',
        Value: reportData.onsite.metadata.description || 'Missing',
        'Char Count': reportData.onsite.metadata.description?.length || 0,
      });
    }

    if (onsiteData.length > 0) {
      tables.push('=== ON-PAGE METRICS ===');
      tables.push(convertToCSV(onsiteData));
      tables.push('');
    }
  }

  return tables.join('\n');
}

/**
 * Export SEO report in multiple formats
 */
export function exportSEOReport(data: any, format: 'csv' | 'json', filename?: string) {
  const timestamp = new Date().toISOString().split('T')[0];
  const baseFilename = filename || `seo-report-${timestamp}`;

  if (format === 'csv') {
    const csv = convertSEOReportToCSV(data);
    downloadCSV([{ data: csv }], `${baseFilename}.csv`);
  } else if (format === 'json') {
    downloadJSONFile(data, `${baseFilename}.json`);
  }
}
