"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import type { Milestone } from "@/lib/data"
import { Slider } from "../ui/slider"

// ✅ FIXED SCHEMA — using dueDate only
const milestoneSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  dueDate: z.date({ required_error: "A due date is required." }),
  progress: z.number().min(0).max(100),
})

type MilestoneFormValues = z.infer<typeof milestoneSchema>

interface EditMilestoneDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  milestone: Milestone
  onUpdateMilestone: (milestone: Milestone) => void
}

export function EditMilestoneDialog({
  isOpen,
  onOpenChange,
  milestone,
  onUpdateMilestone,
}: EditMilestoneDialogProps) {

  const form = useForm<MilestoneFormValues>({
    resolver: zodResolver(milestoneSchema),
    defaultValues: {
      title: milestone.title,
      description: milestone.description,
      dueDate: new Date(milestone.dueDate), // ← correct date loading
      progress: milestone.progress ?? 0,
    },
  })

  // Sync when modal opens
  useEffect(() => {
    form.reset({
      title: milestone.title,
      description: milestone.description,
      dueDate: new Date(milestone.dueDate),
      progress: milestone.progress ?? 0,
    })
  }, [milestone, isOpen, form])

  // Submit → convert to backend format
  const onSubmit = (data: MilestoneFormValues) => {
    onUpdateMilestone({
      ...milestone,
      title: data.title,
      description: data.description,
      dueDate: data.dueDate.toISOString(), // ← backend requires dueDate
      progress: data.progress,
      projectId: milestone.projectId,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Milestone</DialogTitle>
          <DialogDescription>
            Update the milestone and click save.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">

            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Q4 Product Launch" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe the milestone..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Due Date */}
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Due Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? format(field.value, "PPP") : "Pick a date"}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>

                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Progress Slider */}
            <FormField
              control={form.control}
              name="progress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Progress: {field.value}%</FormLabel>
                  <FormControl>
                    <Slider
                      min={0}
                      max={100}
                      step={1}
                      defaultValue={[field.value]}
                      onValueChange={(v) => field.onChange(v[0])}
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
