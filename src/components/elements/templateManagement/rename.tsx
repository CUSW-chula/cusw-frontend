'use client';
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useEffect, useState } from 'react'
import BASE_URL from '@/lib/shared'
import { getCookie } from 'cookies-next'
import { toast } from '@/hooks/use-toast'
import type { Template } from '@/app/types/createProjectType'

interface EditTemplateProps {
  template?: Template
  onSuccess?: () => void
}

export function EditTemplate({ template, onSuccess }: EditTemplateProps) {
  const [open, setOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (template) {
      setNewName(template.fileName.replace('.json', ''))
    }
  }, [template])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!template || !newName.trim()) return

    setIsLoading(true)
    const auth = getCookie('auth')?.toString() || ''

    try {
      const response = await fetch(`${BASE_URL}/v2/template/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: auth
        },
        body: JSON.stringify({
          templateId: template.id,
          newFileName: `${newName}.json`
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update template')
      }

      toast({
        title: '✅ Update Successful',
        description: 'Template name has been updated',
        variant: 'default'
      })

      setOpen(false)
      onSuccess?.()
      window.location.reload()
    } catch (error) {
      toast({
        title: '🚨 Update Failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline"
          disabled={!template}
          className="px-4 py-2 bg-brown hover:bg-brown/80 text-white flex gap-2"
        >
          Rename
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Template Name</DialogTitle>
            <DialogDescription>
              Update the template name below. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="col-span-3"
                placeholder="Enter new template name"
                required
                minLength={1}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="submit"
              disabled={isLoading || !newName.trim() || newName === template?.fileName.replace('.json', '')}
            >
              {isLoading ? 'Saving...' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}