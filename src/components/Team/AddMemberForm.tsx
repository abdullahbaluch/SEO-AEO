
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
// import { TeamMember } from "@/entities/TeamMember";

const roles = [
  "Marketing Manager",
  "Content Creator", 
  "Social Media Specialist",
  "SEO Specialist",
  "PPC Specialist",
  "Designer",
  "Copywriter",
  "Data Analyst"
];

const skillLabels = {
  content_creation: "Content Creation",
  social_media: "Social Media",
  seo: "SEO",
  ppc_advertising: "PPC Advertising", 
  design: "Design",
  copywriting: "Copywriting",
  analytics: "Analytics",
  strategy: "Strategy"
};

export default function AddMemberForm({ open, onOpenChange, onMemberAdded }: { open: boolean; onOpenChange: (open: boolean) => void; onMemberAdded: () => void }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    skills: {
      content_creation: 5,
      social_media: 5,
      seo: 5,
      ppc_advertising: 5,
      design: 5,
      copywriting: 5,
      analytics: 5,
      strategy: 5
    },
    availability: 100,
    current_workload: 0
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // await TeamMember.create(formData);
      onMemberAdded();
      onOpenChange(false);
      setFormData({
        name: "",
        email: "",
        role: "",
        skills: {
          content_creation: 5,
          social_media: 5,
          seo: 5,
          ppc_advertising: 5,
          design: 5,
          copywriting: 5,
          analytics: 5,
          strategy: 5
        },
        availability: 100,
        current_workload: 0
      });
    } catch (error) {
      console.error("Error adding team member:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                {roles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </Select>
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Member"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}