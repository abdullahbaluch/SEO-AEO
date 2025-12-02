
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
// import { TeamMember } from "@/entities/TeamMember";
import { Loader2 } from 'lucide-react';

const roles = [
  "Marketing Manager", "Content Creator", "Social Media Specialist", 
  "SEO Specialist", "PPC Specialist", "Designer", "Copywriter", "Data Analyst"
];

const skillLabels = {
  content_creation: "Content Creation", social_media: "Social Media", seo: "SEO",
  ppc_advertising: "PPC Advertising", design: "Design", copywriting: "Copywriting",
  analytics: "Analytics", strategy: "Strategy"
};

export default function EditTeamMemberForm({ open, onOpenChange, member, onMemberUpdated }: { open: boolean; onOpenChange: (open: boolean) => void; member: any; onMemberUpdated: () => void }) {
  const [formData, setFormData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name || "",
        email: member.email || "",
        role: member.role || "",
        skills: {
          content_creation: member.skills?.content_creation || 5,
          social_media: member.skills?.social_media || 5,
          seo: member.skills?.seo || 5,
          ppc_advertising: member.skills?.ppc_advertising || 5,
          design: member.skills?.design || 5,
          copywriting: member.skills?.copywriting || 5,
          analytics: member.skills?.analytics || 5,
          strategy: member.skills?.strategy || 5
        },
        availability: member.availability || 100,
        current_workload: member.current_workload || 0
      });
    }
  }, [member]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member || !formData) return;
    setIsSubmitting(true);
    try {
      // await TeamMember.update(member.id, formData);
      onMemberUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating team member:", error);
      // Add user-facing error handling here if desired
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkillChange = (skill: string, value: number[]) => {
    setFormData((prev: any) => ({
      ...prev,
      skills: { ...prev.skills, [skill]: value[0] }
    }));
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  if (!formData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-600 text-white max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle>Edit Team Member</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="p-6 pt-0 space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="role">Role</Label>
            <Select value={formData.role} onChange={(e) => handleInputChange('role', e.target.value)}>
              {roles.map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...</> : "Update Member"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
 