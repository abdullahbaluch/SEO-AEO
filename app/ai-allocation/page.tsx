
import React, { useState, useEffect } from "react";
import { Task } from "@/entities/Task";
import { TeamMember } from "@/entities/TeamMember";
import { InvokeLLM } from "@/integrations/Core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Zap, Users, CheckSquare, Loader2, Sparkles, TrendingUp, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from 'date-fns';

export default function AIAllocation() {
  const [tasks, setTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAllocating, setIsAllocating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [taskList, members] = await Promise.all([
        Task.filter({ status: "Backlog" }), // Only backlog tasks for allocation
        TeamMember.list()
      ]);
      setTasks(taskList);
      setTeamMembers(members);
    } catch (error) {
      console.error("Error loading data:", error);
      setError("Failed to load data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIAllocations = async () => {
    if (tasks.length === 0 || teamMembers.length === 0) {
      setError("Need both unassigned tasks and team members to generate allocations.");
      return;
    }

    setIsAllocating(true);
    setError(null);

    try {
      const prompt = `
        You are an AI task allocation system for a marketing team. Your goal is to assign the following backlog tasks to the most suitable team members.

        BACKLOG TASKS TO ALLOCATE:
        ${tasks.map(task => `
        - Task ID: ${task.id}
        - Title: ${task.title}
        - Description: ${task.description.substring(0,150)}... 
        - Priority: ${task.priority}
        - Required Skills: ${task.required_skills?.join(', ') || 'None specified'}
        - Estimated Hours: ${task.estimated_hours || 'Not specified'}
        - Due Date: ${task.due_date ? format(new Date(task.due_date), 'yyyy-MM-dd') : 'Not set'}
        `).join('\n')}

        AVAILABLE TEAM MEMBERS:
        ${teamMembers.map(member => `
        - Member ID: ${member.id}
        - Name: ${member.name}
        - Role: ${member.role}
        - Current Workload: ${member.current_workload || 0}% (lower is better)
        - Availability: ${member.availability || 100}% (higher is better)
        - Skills (level 1-10): ${Object.entries(member.skills || {}).map(([skill, level]) => `${skill.replace("_", " ")}: ${level}`).join(', ')}
        `).join('\n')}

        Please provide task allocations as a JSON object. For each task, assign it to ONE team member.
        Consider these factors for each assignment:
        1.  Skill Match: How well do the member's skills align with task requirements?
        2.  Workload: Is the member's current workload reasonable for new tasks?
        3.  Availability: Is the member available to take on new tasks?
        4.  Priority: Ensure high-priority tasks are assigned appropriately.
        5.  Due Dates: Consider due dates when assigning tasks, especially urgent ones.

        The output should be a JSON object with a single key "allocations".
        "allocations" should be an array of objects, where each object represents a task assignment and includes:
        - task_id: (string) The ID of the task.
        - member_id: (string) The ID of the assigned team member.
        - confidence_score: (number, 0.0 to 1.0) Your confidence in this assignment.
        - reasoning: (string) A brief explanation for this assignment (max 50 words).
        - estimated_completion_time_in_days: (number) Your estimate of how many days this task will take for this specific member.

        Example for one allocation object:
        {
          "task_id": "task_abc",
          "member_id": "member_xyz",
          "confidence_score": 0.85,
          "reasoning": "Strong skill match in SEO and content. Member has moderate workload and good availability.",
          "estimated_completion_time_in_days": 3
        }

        Assign all provided tasks. If a task cannot be reasonably assigned, you may omit it but aim to assign as many as possible.
      `;

      const result = await InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            allocations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  task_id: { type: "string" },
                  member_id: { type: "string" },
                  confidence_score: { type: "number" },
                  reasoning: { type: "string" },
                  estimated_completion_time_in_days: { type: "number" }
                },
                required: ["task_id", "member_id", "confidence_score", "reasoning", "estimated_completion_time_in_days"]
              }
            }
          },
          required: ["allocations"]
        }
      });
      
      if (result && result.allocations) {
 