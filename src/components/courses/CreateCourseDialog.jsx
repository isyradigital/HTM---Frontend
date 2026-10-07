import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function CreateCourseDialog({ open, onOpenChange, onSubmit }) {
  const [courseData, setCourseData] = useState({
    title: "",
    code: "",
    description: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit(courseData);
    setCourseData({ title: "", code: "", description: "" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Course</DialogTitle>
          <DialogDescription>
            Add details for the new course. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Course Title</Label>
              <Input
                id="title"
                value={courseData.title}
                onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
                placeholder="e.g. Advanced Nursing Practices"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="code">Course Code</Label>
              <Input
                id="code"
                value={courseData.code}
                onChange={(e) => setCourseData({ ...courseData, code: e.target.value })}
                placeholder="e.g. NRSG-301"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={courseData.description}
                onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
                placeholder="Brief description about the course..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Course</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
