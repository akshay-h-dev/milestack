'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

import MilestoneCard from '@/components/milestones/milestone-card'
import { Button } from '@/components/ui/button'
import { Milestone, Project } from '@/lib/data'
import { Plus, Target } from 'lucide-react'
import { AddMilestoneDialog } from '@/components/milestones/add-milestone-dialog'
import { EditMilestoneDialog } from '@/components/milestones/edit-milestone-dialog'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

import {
  fetchMilestones,
  createMilestone,
  updateMilestone,
  deleteMilestone,
  fetchProjects,
} from '@/lib/api'

export default function MilestonesPage() {
  const params = useSearchParams()
  const router = useRouter()
  const projectId = params.get('projectId')

  const [project, setProject] = useState<Project | null>(null)
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(true)

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedMilestone, setSelectedMilestone] =
    useState<Milestone | null>(null)

  /* -------------------------------------------------
     LOAD PROJECT & VALIDATE MEMBERSHIP
  ------------------------------------------------- */
  useEffect(() => {
    async function load() {
      if (!projectId) {
        setLoading(false)
        return
      }

      const projects = await fetchProjects()
      const found = projects.find((p) => p.id === projectId) || null

      setProject(found)

      // ❌ invalid project
      if (!found) {
        setLoading(false)
        return
      }

      // ✔ load milestones
      const ms = await fetchMilestones(projectId)
      setMilestones(Array.isArray(ms) ? ms : [])

      setLoading(false)
    }
    load()
  }, [projectId])

  /* -------------------------------------------------
     REDIRECT IF INVALID PROJECT
  ------------------------------------------------- */
  if (!loading && !project) {
    return (
      <div className="p-6">
        <h2 className="text-lg font-semibold">Project not found</h2>
        <p className="text-muted-foreground">
          You may no longer have access to this project.
        </p>
        <Button className="mt-4" onClick={() => router.push('/projects')}>
          Back to Projects →
        </Button>
      </div>
    )
  }

  /* -------------------------------------------------
     ADD MILESTONE
  ------------------------------------------------- */
  const handleAddMilestone = async (formData: any) => {
    if (!projectId) return

    const created = await createMilestone({
      title: formData.title,
      description: formData.description,
      dueDate: formData.dueDate,
      projectId,
      status: 'pending',
    })

    setMilestones((prev) => [created, ...prev])
  }

  /* -------------------------------------------------
     UPDATE MILESTONE
  ------------------------------------------------- */
  const handleUpdateMilestone = async (updated: Milestone) => {
    const saved = await updateMilestone(updated.id, {
      title: updated.title,
      description: updated.description,
      dueDate: updated.dueDate,
      progress: updated.progress,
      status: updated.status,
      projectId,
    })

    setMilestones((prev) =>
      prev.map((m) => (m.id === saved.id ? saved : m)),
    )

    setIsEditDialogOpen(false)
    setSelectedMilestone(null)
  }

  /* -------------------------------------------------
     DELETE
  ------------------------------------------------- */
  const confirmDelete = async () => {
    if (!selectedMilestone) return

    await deleteMilestone(selectedMilestone.id)
    setMilestones((prev) =>
      prev.filter((m) => m.id !== selectedMilestone.id),
    )

    setIsDeleteDialogOpen(false)
    setSelectedMilestone(null)
  }

  /* -------------------------------------------------
     UI
  ------------------------------------------------- */
  return (
    <div className="flex-1 flex flex-col">
      <header className="bg-card border-b p-4 px-6">
        <div className="flex items-center justify-between w-full">
          <h1 className="text-2xl font-bold">Milestones</h1>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus />
            New Milestone
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        {milestones.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {milestones.map((m) => (
              <MilestoneCard
                key={m.id}
                milestone={m}
                onEdit={() => {
                  setSelectedMilestone(m)
                  setIsEditDialogOpen(true)
                }}
                onRemove={() => {
                  setSelectedMilestone(m)
                  setIsDeleteDialogOpen(true)
                }}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center h-full justify-center text-center text-muted-foreground">
            <Target className="w-16 h-16 mb-4 text-primary/20" />
            <h3 className="text-lg font-semibold text-foreground">
              No Milestones Yet
            </h3>
            <p className="mb-4">Create your first milestone.</p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Milestone
            </Button>
          </div>
        )}
      </div>

      {/* ADD */}
      <AddMilestoneDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAddMilestone={handleAddMilestone}
        projectId={projectId!}
      />

      {/* EDIT */}
      {selectedMilestone && (
        <EditMilestoneDialog
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          milestone={selectedMilestone}
          onUpdateMilestone={handleUpdateMilestone}
        />
      )}

      {/* DELETE */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Milestone?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground"
              onClick={confirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
