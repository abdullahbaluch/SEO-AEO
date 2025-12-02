'use client'

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ArrowLeft, UserPlus } from "lucide-react";
import { createPageUrl } from "@/lib/utils";

export default function Team() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 p-8">
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
            <Users className="w-8 h-8 text-purple-500" />
            <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
          </div>
          <p className="text-gray-600">Manage your marketing team members and skills</p>
        </div>

        {/* Coming Soon Card */}
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-white to-purple-50/30">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="bg-purple-100 p-4 rounded-full">
                <UserPlus className="w-12 h-12 text-purple-500" />
              </div>
            </div>
            <CardTitle className="text-2xl">Team Management Coming Soon</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600 max-w-2xl mx-auto">
              This feature will provide comprehensive team management capabilities, including:
            </p>
            <ul className="text-left max-w-md mx-auto space-y-2 text-gray-700">
              <li>• Team member profiles</li>
              <li>• Skills and expertise tracking</li>
              <li>• Workload and availability management</li>
              <li>• Performance metrics</li>
              <li>• Role assignments</li>
            </ul>
            <div className="pt-4">
              <p className="text-sm text-gray-500">
                This feature requires database setup. Configure your database to enable team management.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
