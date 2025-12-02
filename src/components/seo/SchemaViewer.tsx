import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  XCircle, 
  Copy, 
  ChevronDown, 
  ChevronUp,
  Lightbulb,
  Code
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SchemaGenerator } from './SchemaGenerator';

export default function SchemaViewer({ schemas, suggestions, metadata, headings }) {
  const [expandedSchema, setExpandedSchema] = useState(null);
  const [generatedSchema, setGeneratedSchema] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateSchema = (type) => {
    const schema = SchemaGenerator.generateSchema(type, { 
      metadata, 
      headings,
      schemas 
    });
    setGeneratedSchema({ type, schema });
  };

  return (
    <div className="space-y-6">
      {/* Detected Schemas */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">
          Detected Structured Data ({schemas?.length || 0})
        </h3>

        {(!schemas || schemas.length === 0) ? (
          <div className="text-center py-8">
            <XCircle className="w-12 h-12 text-red-300 mx-auto mb-3" />
            <p className="text-gray-500">No JSON-LD structured data found</p>
            <p className="text-sm text-gray-400 mt-1">
              Add schema.org markup to improve search visibility
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {schemas.map((schema, index) => (
              <div
                key={index}
                className={`border rounded-xl overflow-hidden ${
                  schema.valid 
                    ? 'border-emerald-200 bg-emerald-50' 
                    : 'border-red-200 bg-red-50'
                }`}
              >
                <button
                  onClick={() => setExpandedSchema(expandedSchema === index ? null : index)}
                  className="w-full px-4 py-3 flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-3">
                    {schema.valid ? (
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <div>
                      <span className="font-medium text-gray-900">{schema.type}</span>
                      {!schema.valid && (
                        <p className="text-xs text-red-600 mt-0.5">{schema.error}</p>
                      )}
                    </div>
                  </div>
                  {expandedSchema === index ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                <AnimatePresence>
                  {expandedSchema === index && schema.valid && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-2 border-t border-emerald-200/50">
                        <div className="flex justify-end mb-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(JSON.stringify(schema.data, null, 2))}
                          >
                            <Copy className="w-4 h-4 mr-1" />
                            {copied ? 'Copied!' : 'Copy'}
                          </Button>
                        </div>
                        <pre className="text-xs bg-white/70 p-3 rounded-lg overflow-auto max-h-64 font-mono">
                          {JSON.stringify(schema.data, null, 2)}
                        </pre>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Schema Suggestions */}
      {suggestions && suggestions.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-semibold text-gray-900">Suggested Schemas</h3>
          </div>

          <div className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="p-4 bg-amber-50 border border-amber-200 rounded-xl"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{suggestion.type}</h4>
                    <p className="text-sm text-gray-600 mt-1">{suggestion.reason}</p>
                    {suggestion.detected && suggestion.detected.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-1">Detected content:</p>
                        <ul className="text-xs text-gray-600 space-y-0.5">
                          {suggestion.detected.slice(0, 3).map((item, i) => (
                            <li key={i} className="truncate">• {item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleGenerateSchema(suggestion.type)}
                  >
                    <Code className="w-4 h-4 mr-1" />
                    Generate
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generated Schema */}
      <AnimatePresence>
        {generatedSchema && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-2xl border border-gray-100 p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">
                Generated {generatedSchema.type} Schema
              </h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(SchemaGenerator.formatAsScriptTag(generatedSchema.schema))}
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copy Script Tag
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setGeneratedSchema(null)}
                >
                  Close
                </Button>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-2">
                Copy this code and paste it in your page's &lt;head&gt; section:
              </p>
              <pre className="text-xs font-mono overflow-auto max-h-80 bg-gray-900 text-emerald-400 p-4 rounded-lg">
                {SchemaGenerator.formatAsScriptTag(generatedSchema.schema)}
              </pre>
            </div>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> Review and fill in the placeholder values before using this schema.
                Test it with Google's Rich Results Test after implementation.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}