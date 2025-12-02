'use client'

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Sparkles, ArrowLeft, Zap } from "lucide-react";
import { createPageUrl } from "@/lib/utils";

export default function AIAllocation() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <div className="mb-8">
          <Link href={createPageUrl('Dashboard')}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Brain className="w-8 h-8 text-indigo-500" />
            <h1 className="text-3xl font-bold text-gray-900">AI Task Allocation</h1>
          </div>
          <p className="text-gray-600">Intelligent task assignment powered by AI</p>
        </div>

        {/* Coming Soon Card */}
        <Card className="border-2 border-indigo-200 bg-gradient-to-br from-white to-indigo-50/30">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="bg-indigo-100 p-4 rounded-full">
                <Sparkles className="w-12 h-12 text-indigo-500" />
              </div>
            </div>
            <CardTitle className="text-2xl">AI Task Allocation Coming Soon</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600 max-w-2xl mx-auto">
              This feature will use advanced AI to intelligently assign tasks to team members based on:
            </p>
            <ul className="text-left max-w-md mx-auto space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <Zap className="w-5 h-5 text-indigo-500 mt-0.5" />
                <span>Skill matching and expertise levels</span>
              </li>
              <li className="flex items-start gap-2">
                <Zap className="w-5 h-5 text-indigo-500 mt-0.5" />
                <span>Current workload and availability</span>
              </li>
              <li className="flex items-start gap-2">
                <Zap className="w-5 h-5 text-indigo-500 mt-0.5" />
                <span>Task priority and complexity</span>
              </li>
              <li className="flex items-start gap-2">
                <Zap className="w-5 h-5 text-indigo-500 mt-0.5" />
                <span>Historical performance data</span>
              </li>
            </ul>
            <div className="pt-4">
              <p className="text-sm text-gray-500">
                This feature requires LLM integration setup. Visit the documentation to configure AI capabilities.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Features</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Automated task assignment based on AI analysis of team capabilities and workload
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Setup Required</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Configure an LLM integration (OpenAI, Anthropic, etc.) to enable this feature
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Benefits</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Optimize team efficiency and ensure balanced workload distribution across members
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
