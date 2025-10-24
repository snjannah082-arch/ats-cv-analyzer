'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { JobRequirement, Job } from '@/lib/job-model'
import { Briefcase, MapPin, Calendar, Users, Plus, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { v4 as uuidv4 } from 'uuid'

export default function JobsPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [jobs, setJobs] = useState<Job[]>([])
  const [showForm, setShowForm] = useState(false)
  const [requirements, setRequirements] = useState<JobRequirement[]>([
    {
      skillName: '',
      category: 'frontend',
      minimumYears: 1,
      isRequired: true,
      weight: 5
    }
  ])
  
  useEffect(() => {
    // Load jobs from localStorage
    const storedJobs = localStorage.getItem('jobs')
    if (storedJobs) {
      const parsedJobs = JSON.parse(storedJobs)
      setJobs(parsedJobs.map((job: any) => ({
        ...job,
        createdAt: new Date(job.createdAt)
      })))
    }
  }, [])

  const handleAddRequirement = () => {
    setRequirements([
      ...requirements,
      {
        skillName: '',
        category: 'frontend',
        minimumYears: 1,
        isRequired: true,
        weight: 5
      }
    ])
  }

  const handleRequirementChange = (index: number, field: keyof JobRequirement, value: any) => {
    const updatedRequirements = [...requirements]
    updatedRequirements[index] = {
      ...updatedRequirements[index],
      [field]: value
    }
    setRequirements(updatedRequirements)
  }

  const handleRemoveRequirement = (index: number) => {
    const updatedRequirements = [...requirements]
    updatedRequirements.splice(index, 1)
    setRequirements(updatedRequirements)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Filter out empty skill requirements
    const validRequirements = requirements.filter(req => req.skillName.trim() !== '')
    
    const job = {
      id: uuidv4(),
      title,
      description,
      location,
      requirements: validRequirements,
      createdAt: new Date(),
      status: 'active'
    }
    
    // In a real app, you would save this to a database
    // For now, we'll save to localStorage
    const existingJobs = JSON.parse(localStorage.getItem('jobs') || '[]')
    const updatedJobs = [...existingJobs, job]
    localStorage.setItem('jobs', JSON.stringify(updatedJobs))
    
    // Update local state
    setJobs(updatedJobs.map((j: any) => ({
      ...j,
      createdAt: new Date(j.createdAt)
    })))
    
    // Reset form
    setTitle('')
    setDescription('')
    setLocation('')
    setRequirements([{
      skillName: '',
      category: 'frontend',
      minimumYears: 1,
      isRequired: true,
      weight: 5
    }])
    
    // Hide form
    setShowForm(false)
  }
  
  const handleJobClick = (jobId: string) => {
    // Redirect to candidates page with job ID to show matching candidates
    router.push(`/candidates?jobId=${jobId}`)
  }

  return (
    <>      
      <main className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Job Openings</h1>
            <Button onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Batal' : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Job
                </>
              )}
            </Button>
          </div>
          
          {showForm ? (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
                <CardDescription>
                  Enter job information and required skills
                </CardDescription>
              </CardHeader>
              
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="title" className="text-sm font-medium">Job Title</label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Contoh: Frontend Developer"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="description" className="text-sm font-medium">Job Description</label>
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
                    <label htmlFor="location" className="text-sm font-medium">Location</label>
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
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={handleAddRequirement}
                      >
                        Add Skill
                      </Button>
                    </div>
                    
                    {requirements.map((req, index) => (
                      <div key={index} className="p-4 border rounded-md space-y-3">
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <label htmlFor={`skill-${index}`} className="text-xs font-medium">Nama Skill</label>
                            <Input
                              id={`skill-${index}`}
                              value={req.skillName}
                              onChange={(e) => handleRequirementChange(index, 'skillName', e.target.value)}
                              placeholder="Contoh: React.js"
                            />
                          </div>
                          <div className="w-1/3">
                            <label htmlFor={`category-${index}`} className="text-xs font-medium">Kategori</label>
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
                            <label htmlFor={`years-${index}`} className="text-xs font-medium">Minimum Years</label>
                            <Input
                              id={`years-${index}`}
                              type="number"
                              min="0"
                              value={req.minimumYears}
                              onChange={(e) => handleRequirementChange(index, 'minimumYears', parseInt(e.target.value))}
                            />
                          </div>
                          <div className="w-1/3">
                            <label htmlFor={`weight-${index}`} className="text-xs font-medium">Weight (1-10)</label>
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
                              <label htmlFor={`required-${index}`} className="text-xs">Required</label>
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
          ) : (
            <>
              {jobs.length > 0 ? (
                <div className="max-h-[600px] overflow-y-auto pr-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {jobs.map((job) => (
                      <Card 
                        key={job.id} 
                        className="cursor-pointer hover:shadow-md transition-shadow duration-200"
                        onClick={() => handleJobClick(job.id)}
                      >
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">{job.title}</CardTitle>
                            <Badge variant="outline">{job.status}</Badge>
                          </div>
                          <CardDescription className="flex items-center mt-1">
                            <MapPin className="h-4 w-4 mr-1" /> {job.location}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600 line-clamp-2 mb-3">{job.description}</p>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {job.requirements.slice(0, 3).map((req, idx) => (
                              <Badge key={idx} variant="secondary">
                                {req.skillName} ({req.minimumYears}+ years)
                              </Badge>
                            ))}
                            {job.requirements.length > 3 && (
                              <Badge variant="outline">+{job.requirements.length - 3} more</Badge>
                            )}
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                          <div className="text-sm text-gray-500 flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(job.createdAt).toLocaleDateString('id-ID')}
                          </div>
                          <Button variant="ghost" size="sm" className="gap-1">
                            View Candidates <ArrowRight className="h-4 w-4" />
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <Card className="p-8 text-center">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <Briefcase className="h-12 w-12 text-gray-400" />
                    <h3 className="text-xl font-medium">No job openings yet</h3>
                    <p className="text-gray-500 max-w-md">
                      Add a new job to start matching with available candidates.
                    </p>
                    <Button onClick={() => setShowForm(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Job
                    </Button>
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      </main>
    </>
  )
}