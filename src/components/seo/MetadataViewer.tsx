import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Copy, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function MetadataViewer({ metadata, og, twitter, url }) {
  const [copied, setCopied] = React.useState(null);

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const MetaRow = ({ label, value, recommended, maxLength, minLength }) => {
    const length = value?.length || 0;
    const isTooLong = maxLength && length > maxLength;
    const isTooShort = minLength && length < minLength;
    const hasIssue = isTooLong || isTooShort || !value;

    return (
      <div className="py-3 border-b border-gray-100 last:border-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {!value ? (
                <XCircle className="w-4 h-4 text-red-500" />
              ) : hasIssue ? (
                <AlertCircle className="w-4 h-4 text-amber-500" />
              ) : (
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              )}
              <span className="text-sm font-medium text-gray-700">{label}</span>
              {value && (maxLength || minLength) && (
                <span className={`text-xs ${hasIssue ? 'text-amber-600' : 'text-gray-400'}`}>
                  ({length} chars{maxLength ? `, recommended: ${minLength || 0}-${maxLength}` : ''})
                </span>
              )}
            </div>
            {value ? (
              <p className={`text-sm ${isTooLong ? 'text-amber-700' : 'text-gray-900'}`}>
                {value}
                {isTooLong && (
                  <span className="text-xs text-amber-600 ml-2">
                    (may be truncated in search results)
                  </span>
                )}
              </p>
            ) : (
              <p className="text-sm text-red-600">Not set</p>
            )}
            {recommended && !value && (
              <p className="text-xs text-gray-500 mt-1">Recommended: {recommended}</p>
            )}
          </div>
          {value && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopy(value, label)}
              className="shrink-0"
            >
              {copied === label ? (
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Basic Metadata */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-100 p-5"
      >
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Basic Metadata</h3>
        <div className="divide-y divide-gray-100">
          <MetaRow 
            label="Title" 
            value={metadata?.title} 
            recommended="Page title with main keyword"
            minLength={30}
            maxLength={60}
          />
          <MetaRow 
            label="Meta Description" 
            value={metadata?.description}
            recommended="Compelling description with call-to-action"
            minLength={120}
            maxLength={160}
          />
          <MetaRow 
            label="Canonical URL" 
            value={metadata?.canonical}
            recommended="Absolute URL of the canonical page"
          />
          <MetaRow 
            label="Robots" 
            value={metadata?.robots}
          />
          <MetaRow 
            label="Language" 
            value={metadata?.language}
            recommended="e.g., en, en-US"
          />
          <MetaRow 
            label="Viewport" 
            value={metadata?.viewport}
            recommended="width=device-width, initial-scale=1"
          />
          <MetaRow 
            label="Charset" 
            value={metadata?.charset}
            recommended="UTF-8"
          />
        </div>
      </motion.div>

      {/* Open Graph */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-gray-100 p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Open Graph</h3>
          <a
            href="https://ogp.me/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
          >
            Learn more <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        
        {(!og || Object.keys(og).length === 0) ? (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
              <div>
                <p className="text-sm text-amber-700 font-medium">No Open Graph tags found</p>
                <p className="text-xs text-amber-600 mt-1">
                  Add og:title, og:description, og:image, and og:url for better social sharing
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-100">
              <MetaRow label="og:title" value={og.title} />
              <MetaRow label="og:description" value={og.description} />
              <MetaRow label="og:image" value={og.image} />
              <MetaRow label="og:url" value={og.url} />
              <MetaRow label="og:type" value={og.type} />
              <MetaRow label="og:site_name" value={og.site_name} />
            </div>
            
            {/* Preview */}
            {og.title && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-2">Social Share Preview</p>
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden max-w-sm">
                  {og.image && (
                    <div className="h-32 bg-gray-200 flex items-center justify-center">
                      <img 
                        src={og.image} 
                        alt="" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <div className="p-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                      {og.site_name || new URL(url || 'https://example.com').hostname}
                    </p>
                    <h4 className="font-semibold text-gray-900 text-sm line-clamp-2">
                      {og.title}
                    </h4>
                    {og.description && (
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {og.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* Twitter Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl border border-gray-100 p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Twitter Card</h3>
          <a
            href="https://developer.twitter.com/en/docs/twitter-for-websites/cards"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
          >
            Learn more <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        
        {(!twitter || Object.keys(twitter).length === 0) ? (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <p className="text-sm text-blue-700 font-medium">No Twitter Card tags found</p>
                <p className="text-xs text-blue-600 mt-1">
                  Twitter will fall back to Open Graph tags if available
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            <MetaRow label="twitter:card" value={twitter.card} />
            <MetaRow label="twitter:title" value={twitter.title} />
            <MetaRow label="twitter:description" value={twitter.description} />
            <MetaRow label="twitter:image" value={twitter.image} />
            <MetaRow label="twitter:site" value={twitter.site} />
            <MetaRow label="twitter:creator" value={twitter.creator} />
          </div>
        )}
      </motion.div>

      {/* Additional Metadata */}
      {(metadata?.author || metadata?.generator || metadata?.keywords) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-gray-100 p-5"
        >
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Additional Metadata</h3>
          <div className="divide-y divide-gray-100">
            {metadata?.author && <MetaRow label="Author" value={metadata.author} />}
            {metadata?.generator && <MetaRow label="Generator" value={metadata.generator} />}
            {metadata?.keywords && (
              <div className="py-3">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Meta Keywords</span>
                  <span className="text-xs text-gray-400">(largely ignored by search engines)</span>
                </div>
                <p className="text-sm text-gray-600">{metadata.keywords}</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}