"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import type { Project } from "@/lib/data"
import { updateProject } from "@/lib/api"

const projectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
})

type ProjectFormValues = z.infer<typeof projectSchema>

interface EditProjectDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  project: Project | null
  onUpdateProject: (project: Project) => void
}

export function EditProjectDialog({
  isOpen,
  onOpenChange,
  project,
  onUpdateProject,
}: EditProjectDialogProps) {

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
  })

  useEffect(() => {
    if (project) {
      form.reset({
        title: project.title,
        description: project.description || "",
      })
    }
  }, [project, form, isOpen])

  const onSubmit = async (data: ProjectFormValues) => {
    if (!project) return
    
    try {
      const updated = await updateProject(project.id, {
        title: data.title,
        description: data.description ?? "",
      })

      onUpdateProject(updated)
    } catch (err) {
      console.error("Project update failed:", err)
    }

    onOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>
            Update the project name or description.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter project name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Project description"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
