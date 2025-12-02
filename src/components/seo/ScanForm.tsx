import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Globe, Code, Loader2, Scan } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ScanForm({ onScan, isScanning = false }) {
  const [mode, setMode] = useState('html');
  const [url, setUrl] = useState('');
  const [html, setHtml] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'url') {
      if (!url.trim()) {
        setError('Please enter a URL');
        return;
      }
      try {
        new URL(url);
      } catch {
        setError('Please enter a valid URL');
        return;
      }
      // Note: URL fetching would require a proxy in production
      setError('URL fetching requires server-side support. Please use HTML mode.');
      return;
    }

    if (mode === 'html') {
      if (!html.trim()) {
        setError('Please enter HTML content');
        return;
      }
      onScan({ url: url || 'pasted-content', html });
    }
  };

  const loadSampleHTML = () => {
    setHtml(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sample Page - SEO Toolkit Demo</title>
  <meta name="description" content="This is a sample page to demonstrate the SEO analysis capabilities of the toolkit.">
  <link rel="canonical" href="https://example.com/sample-page">
  <meta property="og:title" content="Sample Page">
  <meta property="og:description" content="Demo page for SEO analysis">
  <meta property="og:image" content="https://example.com/image.jpg">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Sample Article",
    "author": {
      "@type": "Person",
      "name": "John Doe"
    }
  }
  </script>
</head>
<body>
  <header>
    <nav>
      <a href="/">Home</a>
      <a href="/about">About</a>
      <a href="/contact">Contact</a>
    </nav>
  </header>
  <main>
    <h1>Welcome to Our Sample Page</h1>
    <p>This is an introduction paragraph that explains what this page is about. Good content helps with SEO.</p>
    
    <h2>What is SEO?</h2>
    <p>Search Engine Optimization (SEO) is the practice of optimizing websites to rank higher in search results. It involves various techniques including keyword optimization, content quality, and technical improvements.</p>
    
    <h2>Why SEO Matters</h2>
    <p>SEO is crucial for visibility. When your website ranks higher, more people find it. This leads to more traffic, engagement, and conversions.</p>
    
    <h3>Key SEO Factors</h3>
    <ul>
      <li>Quality content</li>
      <li>Mobile-friendliness</li>
      <li>Page speed</li>
      <li>Structured data</li>
    </ul>
    
    <img src="/image.jpg" alt="SEO optimization illustration">
    <img src="/chart.png">
    
    <h2>How to Get Started</h2>
    <p>Getting started with SEO is easier than you think. Follow these steps:</p>
    <ol>
      <li>Audit your current site</li>
      <li>Research keywords</li>
      <li>Optimize your content</li>
      <li>Build quality links</li>
    </ol>
    
    <a href="https://external-site.com" rel="nofollow">External resource</a>
    <a href="/internal-page">Learn more</a>
    <a href="">Click here</a>
  </main>
  <footer>
    <p>© 2024 Sample Site</p>
  </footer>
</body>
</html>`);
    setUrl('https://example.com/sample-page');
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-100 rounded-xl">
          <Scan className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">New Scan</h2>
          <p className="text-sm text-gray-500">Analyze a webpage for SEO issues</p>
        </div>
      </div>

      <Tabs value={mode} onValueChange={setMode}>
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="html" className="flex items-center gap-2">
            <Code className="w-4 h-4" />
            HTML Code
          </TabsTrigger>
          <TabsTrigger value="url" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            URL
          </TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit}>
          <TabsContent value="html" className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Page URL (optional)
                </label>
              </div>
              <Input
                type="text"
                placeholder="https://example.com/page"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  HTML Content
                </label>
                <button
                  type="button"
                  onClick={loadSampleHTML}
                  className="text-xs text-indigo-600 hover:text-indigo-700"
                >
                  Load sample HTML
                </button>
              </div>
              <Textarea
                placeholder="Paste your HTML here..."
                value={html}
                onChange={(e) => setHtml(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
              />
            </div>
          </TabsContent>

          <TabsContent value="url" className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Page URL
              </label>
              <Input
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <p className="text-xs text-amber-600 mt-2">
                Note: URL scanning requires server-side proxy. Use HTML mode for client-side analysis.
              </p>
            </div>
          </TabsContent>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-50 border border-red-200 rounded-lg mt-4"
            >
              <p className="text-sm text-red-600">{error}</p>
            </motion.div>
          )}

          <Button
            type="submit"
            disabled={isScanning}
            className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700"
          >
            {isScanning ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Scan className="w-4 h-4 mr-2" />
                Start Analysis
              </>
            )}
          </Button>
        </form>
      </Tabs>
    </div>
  );
}