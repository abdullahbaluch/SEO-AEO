import React, { useState } from 'react';
import { base44 } from '@/lib/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Search,
  Loader2,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Type,
  BookOpen
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function ContentOptimizer() {
  const [content, setContent] = useState('');
  const [targetKeyword, setTargetKeyword] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeContent = async () => {
    if (!content.trim() || !targetKeyword.trim()) return;
    
    setIsAnalyzing(true);
    
    try {
      // Local analysis
      const words = content.toLowerCase().split(/\s+/).filter(w => w.length > 0);
      const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const wordCount = words.length;
      const sentenceCount = sentences.length;
      const avgWordsPerSentence = sentenceCount ? wordCount / sentenceCount : 0;
      
      // Keyword analysis
      const keywordLower = targetKeyword.toLowerCase();
      const keywordWords = keywordLower.split(/\s+/);
      const keywordCount = words.filter(w => keywordWords.includes(w)).length;
      const keywordDensity = wordCount ? ((keywordCount / wordCount) * 100).toFixed(2) : 0;
      
      // Flesch Reading Ease (simplified)
      const syllableCount = words.reduce((sum, word) => sum + countSyllables(word), 0);
      const readingEase = Math.max(0, Math.min(100, 
        206.835 - (1.015 * avgWordsPerSentence) - (84.6 * (syllableCount / wordCount))
      ));
      
      // Generate suggestions
      const suggestions = [];
      
      if (wordCount < 300) {
        suggestions.push({ type: 'warning', text: 'Content is too short. Aim for at least 300 words for better SEO.' });
      } else if (wordCount < 600) {
        suggestions.push({ type: 'info', text: 'Consider expanding content to 600+ words for comprehensive coverage.' });
      } else {
        suggestions.push({ type: 'success', text: 'Good content length for SEO.' });
      }
      
      if (keywordDensity < 0.5) {
        suggestions.push({ type: 'warning', text: `Keyword density is low (${keywordDensity}%). Include "${targetKeyword}" more naturally.` });
      } else if (keywordDensity > 3) {
        suggestions.push({ type: 'warning', text: `Keyword density is high (${keywordDensity}%). Reduce to avoid keyword stuffing.` });
      } else {
        suggestions.push({ type: 'success', text: `Good keyword density (${keywordDensity}%).` });
      }
      
      if (avgWordsPerSentence > 25) {
        suggestions.push({ type: 'warning', text: 'Sentences are too long. Break them up for better readability.' });
      }
      
      if (readingEase < 30) {
        suggestions.push({ type: 'warning', text: 'Content is difficult to read. Simplify language and sentence structure.' });
      } else if (readingEase < 50) {
        suggestions.push({ type: 'info', text: 'Content readability could be improved.' });
      } else {
        suggestions.push({ type: 'success', text: 'Good readability score.' });
      }
      
      // Check for keyword in first paragraph
      const firstParagraph = content.split('\n')[0]?.toLowerCase() || '';
      if (!firstParagraph.includes(keywordLower)) {
        suggestions.push({ type: 'info', text: 'Include your target keyword in the first paragraph.' });
      }
      
      // Generate semantic keywords using LLM
      let semanticKeywords = [];
      try {
        const llmResponse = await base44.integrations.Core.InvokeLLM({
          prompt: `Given the target keyword "${targetKeyword}", suggest 8 related semantic keywords or phrases that should be included in SEO-optimized content. Return only the keywords as a JSON array of strings.`,
          response_json_schema: {
            type: 'object',
            properties: {
              keywords: { type: 'array', items: { type: 'string' } }
            }
          }
        });
        semanticKeywords = llmResponse.keywords || [];
      } catch (e) {
        // Fallback semantic keywords
        semanticKeywords = [
          `${targetKeyword} guide`,
          `best ${targetKeyword}`,
          `${targetKeyword} tips`,
          `how to ${targetKeyword}`,
        ];
      }
      
      // Calculate overall score
      let score = 50;
      if (wordCount >= 600) score += 15;
      else if (wordCount >= 300) score += 10;
      if (keywordDensity >= 0.5 && keywordDensity <= 3) score += 20;
      if (readingEase >= 50) score += 15;
      else if (readingEase >= 30) score += 10;
      if (firstParagraph.includes(keywordLower)) score += 10;
      
      setAnalysis({
        score: Math.min(100, score),
        wordCount,
        sentenceCount,
        avgWordsPerSentence: avgWordsPerSentence.toFixed(1),
        keywordDensity,
        keywordCount,
        readingEase: readingEase.toFixed(0),
        suggestions,
        semanticKeywords,
      });
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const countSyllables = (word) => {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    const matches = word.match(/[aeiouy]{1,2}/g);
    return matches ? matches.length : 1;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const getReadabilityLabel = (score) => {
    if (score >= 80) return 'Very Easy';
    if (score >= 60) return 'Easy';
    if (score >= 40) return 'Moderate';
    if (score >= 20) return 'Difficult';
    return 'Very Difficult';
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-500" />
          Content Optimizer
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Target Keyword
            </label>
            <Input
              placeholder="e.g., best running shoes"
              value={targetKeyword}
              onChange={(e) => setTargetKeyword(e.target.value)}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Content
            </label>
            <Textarea
              placeholder="Paste your content here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[200px]"
            />
          </div>
          
          <Button 
            onClick={analyzeContent} 
            disabled={isAnalyzing || !content.trim() || !targetKeyword.trim()}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Analyze Content
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Results */}
      {analysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Score Overview */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-900">Content Score</h4>
                <p className="text-sm text-gray-500">Optimization for "{targetKeyword}"</p>
              </div>
              <div className={`text-4xl font-bold ${getScoreColor(analysis.score)}`}>
                {analysis.score}
              </div>
            </div>
            <Progress value={analysis.score} className="h-3" />
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <Type className="w-4 h-4" />
                Word Count
              </div>
              <div className="text-2xl font-bold text-gray-900">{analysis.wordCount}</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <Search className="w-4 h-4" />
                Keyword Density
              </div>
              <div className="text-2xl font-bold text-indigo-600">{analysis.keywordDensity}%</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <BookOpen className="w-4 h-4" />
                Readability
              </div>
              <div className="text-2xl font-bold text-purple-600">{analysis.readingEase}</div>
              <div className="text-xs text-gray-500">{getReadabilityLabel(analysis.readingEase)}</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                Avg Sentence
              </div>
              <div className="text-2xl font-bold text-gray-900">{analysis.avgWordsPerSentence}</div>
              <div className="text-xs text-gray-500">words</div>
            </div>
          </div>

          {/* Suggestions */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              Suggestions
            </h4>
            <div className="space-y-3">
              {analysis.suggestions.map((suggestion, i) => (
                <div key={i} className="flex items-start gap-3">
                  {suggestion.type === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5" />
                  ) : suggestion.type === 'warning' ? (
                    <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                  ) : (
                    <Lightbulb className="w-5 h-5 text-blue-500 mt-0.5" />
                  )}
                  <span className="text-sm text-gray-700">{suggestion.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Semantic Keywords */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-4">
              Suggested Semantic Keywords
            </h4>
            <div className="flex flex-wrap gap-2">
              {analysis.semanticKeywords.map((kw, i) => (
                <Badge key={i} variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                  {kw}
                </Badge>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}