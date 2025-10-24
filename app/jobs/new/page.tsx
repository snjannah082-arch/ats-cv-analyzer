'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { v4 as uuidv4 } from 'uuid'

export default function NewJobPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [requirements, setRequirements] = useState<any[]>([
    {
      skillName: '',
      category: 'frontend',
      minimumYears: 1,
      isRequired: true,
      weight: 5,
    },
  ])

  const handleAddRequirement = () => {
    setRequirements((prev) => [
      ...prev,
      {
        skillName: '',
        category: 'frontend',
        minimumYears: 1,
        isRequired: true,
        weight: 5,
      },
    ])
  }

  const handleRequirementChange = (index: number, field: string, value: any) => {
    const updated = [...requirements]
    updated[index] = {
      ...updated[index],
      [field]: value,
    }
    setRequirements(updated)
  }

  const handleRemoveRequirement = (index: number) => {
    const updated = [...requirements]
    updated.splice(index, 1)
    setRequirements(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validRequirements = requirements.filter((req) => req.skillName.trim() !== '')

    const job = {
      id: uuidv4(),
      title,
      description,
      location,
      requirements: validRequirements,
      createdAt: new Date(),
      status: 'active',
    }

    const existingJobs = JSON.parse(localStorage.getItem('jobs') || '[]')
    const updatedJobs = [...existingJobs, job]
    localStorage.setItem('jobs', JSON.stringify(updatedJobs))

    // Redirect to candidates page to start matching for the new job
    router.push(`/candidates?jobId=${job.id}`)
  }

  return (
    <main className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Create New Job</h1>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
            <CardDescription>Enter job information and required skills</CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">
                  Job Title
                </label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Frontend Developer"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Job Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the job opening"
                  className="w-full min-h-[100px] p-2 border rounded-md"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="location" className="text-sm font-medium">
                  Location
                </label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Contoh: Jakarta, Remote"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Skill Requirements</label>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddRequirement}>
                    Add Skill
                  </Button>
                </div>

                {requirements.map((req, index) => (
                  <div key={index} className="p-4 border rounded-md space-y-3">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label htmlFor={`skill-${index}`} className="text-xs font-medium">
                          Nama Skill
                        </label>
                        <Input
                          id={`skill-${index}`}
                          value={req.skillName}
                          onChange={(e) => handleRequirementChange(index, 'skillName', e.target.value)}
                          placeholder="Contoh: React.js"
                        />
                      </div>
                      <div className="w-1/3">
                        <label htmlFor={`category-${index}`} className="text-xs font-medium">
                          Kategori
                        </label>
                        <select
                          id={`category-${index}`}
                          value={req.category}
                          onChange={(e) => handleRequirementChange(index, 'category', e.target.value)}
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="frontend">Frontend</option>
                          <option value="backend">Backend</option>
                          <option value="fullstack">Fullstack</option>
                          <option value="mobile">Mobile</option>
                          <option value="devops">DevOps</option>
                          <option value="design">Design</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <div className="w-1/3">
                        <label htmlFor={`years-${index}`} className="text-xs font-medium">
                          Minimum Years
                        </label>
                        <Input
                          id={`years-${index}`}
                          type="number"
                          min="0"
                          value={req.minimumYears}
                          onChange={(e) => handleRequirementChange(index, 'minimumYears', parseInt(e.target.value))}
                        />
                      </div>
                      <div className="w-1/3">
                        <label htmlFor={`weight-${index}`} className="text-xs font-medium">
                          Weight (1-10)
                        </label>
                        <Input
                          id={`weight-${index}`}
                          type="number"
                          min="1"
                          max="10"
                          value={req.weight}
                          onChange={(e) => handleRequirementChange(index, 'weight', parseInt(e.target.value))}
                        />
                      </div>
                      <div className="w-1/3 flex items-end">
                        <div className="flex items-center space-x-2 h-10">
                          <input
                            type="checkbox"
                            id={`required-${index}`}
                            checked={req.isRequired}
                            onChange={(e) => handleRequirementChange(index, 'isRequired', e.target.checked)}
                            className="rounded border-gray-300"
                          />
                          <label htmlFor={`required-${index}`} className="text-xs">
                            Required
                          </label>
                        </div>
                      </div>
                    </div>

                    {requirements.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveRequirement(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 w-full"
                      >
                        Remove Skill
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>

            <CardFooter>
              <Button type="submit">Save Job</Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </main>
  )
}