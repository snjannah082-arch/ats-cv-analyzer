'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
// Define types locally since @/types module is not found
interface Candidate {
  id: string;
  name: string;
  currentPosition?: string;
  jobTitle?: string;
  currentCompany?: string;
  skills: Array<string | { name: string; yearsOfExperience?: number }>;
  yearsOfExperience?: number;
  totalExperience?: number;
  education?: string;
  status?: 'active' | 'not-to-forward' | 'archived';
  resumeUrl?: string;
}
import { Job, calculateMatchScore } from '@/lib/job-model'
import { 
  Search, 
  Upload, 
  Briefcase, 
  MapPin, 
  Users, 
  Plus, 
  Filter, 
  XCircle, 
  Building,
  ChevronDown,
  MoreVertical,
  Download,
} from 'lucide-react'

function CandidateCard({ candidate, matchScore, onStatusChange, onDelete, selectedJob }: { candidate: Candidate, matchScore?: number, onStatusChange?: (id: string, status: Candidate['status']) => void, onDelete?: (id: string) => void, selectedJob?: Job }) {
  const getCardStyle = () => {
    if (candidate.status === 'not-to-forward') {
      return 'border-red-300 bg-red-50';
    }
    // Highlight green if candidate matches any selected job requirement
    if (selectedJob && Array.isArray(candidate.skills)) {
      const candidateSkillNames = candidate.skills.map((s: any) => typeof s === 'string' ? s.toLowerCase() : (s.name || '').toLowerCase())
      const jobRequirementNames = (selectedJob.requirements || []).map((r: any) => (r.skillName || '').toLowerCase())
      const hasIntersection = jobRequirementNames.some((name: string) => candidateSkillNames.includes(name))
      if (hasIntersection) {
        return 'border-green-400 shadow-[0_0_15px_rgba(74,222,128,0.2)]';
      }
    }
    if (matchScore && matchScore >= 60) {
      return 'border-green-400 shadow-[0_0_15px_rgba(74,222,128,0.2)]';
    } else if (matchScore && matchScore >= 30) {
      return 'border-yellow-400';
    }
    return '';
  };

  return (
    <div className="space-y-2">
      {/* match indicator moved inside card */}
      <Card className={`h-full ${getCardStyle()}`}>
        <CardHeader className="pb-2">
          {typeof matchScore === 'number' && (
            <div className={`${matchScore >= 70 ? 'bg-green-500 text-white' : matchScore > 40 ? 'bg-yellow-500 text-black' : 'bg-gray-500 text-white'} w-full text-center text-base font-medium py-1 rounded-md mb-2`}>
              {matchScore}% match
            </div>
          )}
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">{candidate.name}</CardTitle>
              <CardDescription className="flex items-center mt-1">
                <Building className="h-3 w-3 mr-1" />
                {candidate.currentPosition || candidate.jobTitle || 'Not specified'}
                {candidate.currentCompany && ` at ${candidate.currentCompany}`}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {candidate.status && (
                <Badge className={
                  candidate.status === 'not-to-forward'
                    ? 'bg-red-50 text-red-600 border border-red-200'
                    : candidate.status === 'archived'
                    ? 'bg-gray-100 text-gray-600 border border-gray-200'
                    : 'bg-green-50 text-green-600 border border-green-200'
                }>
                  {candidate.status === 'not-to-forward' ? 'Not to Moving Forward' : candidate.status}
                </Badge>
              )}
              {candidate.resumeUrl && (
                <Button 
                  variant="ghost" 
                  className="h-8 w-8 p-0" 
                  onClick={() => {
                    const url = candidate.resumeUrl!
                    const isPdf = url.startsWith('data:application/pdf') || url.toLowerCase().endsWith('.pdf')
                    const isDocx = url.startsWith('data:application/vnd.openxmlformats-officedocument.wordprocessingml.document') || url.toLowerCase().endsWith('.docx')
                    const ext = isPdf ? 'pdf' : isDocx ? 'docx' : 'pdf'
                    const link = document.createElement('a')
                    link.href = url
                    link.download = `${candidate.name.replace(/\s+/g, '_')}_resume.${ext}`
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                  }}
                  aria-label="Download Resume"
                  title="Download Resume"
                >
                  <Download className="h-4 w-4" />
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0" aria-label="More actions" title="More actions">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Link href={`/candidates/${candidate.id}`} className="w-full">
                      View Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onStatusChange?.(candidate.id, 'active')}>
                    Mark as Active
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onStatusChange?.(candidate.id, 'not-to-forward')}>
                    Mark as Not to Moving Forward
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onStatusChange?.(candidate.id, 'archived')}>
                    Archive
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600" onClick={() => {
                    if (confirm('Delete this candidate?')) onDelete?.(candidate.id)
                  }}>
                    Delete Candidate
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium mb-1">Skills</p>
              <div className="flex flex-wrap gap-1">
                {(Array.isArray(candidate.skills) ? candidate.skills : []).slice(0, 5).map((skill: string | { name: string }, idx: number) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {typeof skill === 'string' ? skill : skill.name}
                  </Badge>
                ))}
                {Array.isArray(candidate.skills) && candidate.skills.length > 5 && (
                  <Badge variant="outline" className="text-xs">+{candidate.skills.length - 5}</Badge>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Experience</p>
              <p className="text-sm text-muted-foreground">
                {candidate.yearsOfExperience || candidate.totalExperience || 0} years
              </p>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Education</p>
              <p className="text-sm text-muted-foreground">
                {candidate.education || 'Not specified'}
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex w-full items-center justify-end">
            <Button variant="outline" asChild>
              <Link href={`/candidates/${candidate.id}`}>
                View Profile
              </Link>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

export default function CandidatesPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'not-to-forward' | 'archived'>('all')
  const [candidates, setCandidates] = useState<any[]>([])
  const [selectedJob, setSelectedJob] = useState<any | null>(null)
  const [jobs, setJobs] = useState<any[]>([])
  const candidatesSectionRef = useRef<HTMLDivElement | null>(null)

  const [tabValue, setTabValue] = useState<'all' | 'active' | 'archived' | 'not-to-forward'>('all')
  
  useEffect(() => {
    // Load candidates from localStorage
    const storedCandidates = localStorage.getItem('candidates')
    if (storedCandidates) {
      setCandidates(JSON.parse(storedCandidates))
    }
    
    // Load jobs from localStorage
    const storedJobs = localStorage.getItem('jobs')
    if (storedJobs) {
      const parsedJobs = JSON.parse(storedJobs)
      setJobs(parsedJobs.map((job: any) => ({
        ...job,
        createdAt: new Date(job.createdAt)
      })))
      
      // Check if jobId is in URL params
      const jobId = searchParams.get('jobId')
      if (jobId) {
        const job = parsedJobs.find((j: any) => j.id === jobId)
        if (job) {
          const selectedJob = {
            ...job,
            createdAt: new Date(job.createdAt)
          }
          setSelectedJob(selectedJob)
          
          // Selected job loaded from URL; highlighting and match scores will be computed inline
        }
      }
    }
  }, [searchParams])
  
  const matchesSearchText = (candidate: any) => {
    return (
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (candidate.currentPosition && candidate.currentPosition.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (candidate.jobTitle && candidate.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (candidate.currentCompany && candidate.currentCompany.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (Array.isArray(candidate.skills) && candidate.skills.some((skill: any) => {
        const skillName = typeof skill === 'string' ? skill : skill.name;
        return skillName.toLowerCase().includes(searchTerm.toLowerCase());
      }))
    )
  }

  const filteredCandidates = candidates.filter((candidate: any) => {
    const matchesSearch = matchesSearchText(candidate)
    const matchesStatus = filterStatus === 'all' || candidate.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const allCount = candidates.filter(matchesSearchText).length
  const activeCandidatesList = candidates.filter((c: any) => c.status === 'active' && matchesSearchText(c))
  const notToForwardCandidatesList = candidates.filter((c: any) => c.status === 'not-to-forward' && matchesSearchText(c))
  const archivedCandidatesList = candidates.filter((c: any) => c.status === 'archived' && matchesSearchText(c))
  const activeCount = activeCandidatesList.length
  const notToForwardCount = notToForwardCandidatesList.length
  const archivedCount = archivedCandidatesList.length

  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }
  
  const handleStatusChange = (id: string, status: Candidate['status']) => {
    setCandidates((prev: any[]) => {
      const updated = prev.map((c: any) => c.id === id ? { ...c, status } : c)
      try { localStorage.setItem('candidates', JSON.stringify(updated)) } catch {}
      return updated
    })
  }
  
  const handleDelete = (id: string) => {
    setCandidates((prev: any[]) => {
      const updated = prev.filter((c: any) => c.id !== id)
      try { localStorage.setItem('candidates', JSON.stringify(updated)) } catch {}
      return updated
    })
  }
  
  const handleStatusFilter = (value: string) => {
    setFilterStatus(value as 'all' | 'active' | 'not-to-forward' | 'archived')
  }
  
  const getCategoryStats = () => {
    const total = candidates.length
    const active = candidates.filter((c: any) => c.status === 'active').length
    const notToForward = candidates.filter((c: any) => c.status === 'not-to-forward').length
    const archived = candidates.filter((c: any) => c.status === 'archived').length
    
    return { total, active, notToForward, archived }
  }
  
  const categoryStats = getCategoryStats()

  return (
    <div>
      {/* Header */}
      <section className="container py-16">
        <div className="mx-auto max-w-4xl text-center space-y-8">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Candidate
            <br />
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              Management System
            </span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Review and analyze all uploaded candidates. Filter by skills, experience, and more.
          </p>
          <div className="flex justify-center gap-4 mt-8">
            
            <Link href="/jobs">
              <Button variant="outline">
                <Briefcase className="mr-2 h-4 w-4" />
                Manage Jobs
              </Button>
            </Link>
            
            <Link href="/upload">
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Upload Resume
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      <section className="container pb-8">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl">Available Jobs</CardTitle>
                <CardDescription>Select a job to see matching candidates</CardDescription>
              </div>
              {jobs.length > 0 && (
                <Link href="/jobs/new">
                  <Button size="sm" variant="default">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Job
                  </Button>
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent>
              {jobs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[300px] overflow-y-auto pr-2">
                  {jobs.map((job) => (
                    <Card 
                      key={job.id} 
                      className={`cursor-pointer hover:shadow-md transition-shadow duration-200 ${selectedJob?.id === job.id ? 'border-primary' : ''}`}
                      onClick={() => {
                        if (selectedJob?.id === job.id) {
                          setSelectedJob(null);
                          router.push('/candidates');
                        } else {
                          setSelectedJob(job);
                          router.push(`/candidates?jobId=${job.id}`);
                        }
                        candidatesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      }}
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{job.title}</CardTitle>
                        <p className="text-sm text-muted-foreground flex items-center">
                          <MapPin className="h-3 w-3 mr-1" /> {job.location}
                        </p>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm line-clamp-2 mb-2">{job.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {job.requirements.slice(0, 3).map((req: any, idx: number) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {req.skillName}
                            </Badge>
                          ))}
                          {job.requirements.length > 3 && (
                            <Badge variant="outline" className="text-xs">+{job.requirements.length - 3}</Badge>
                          )}
                        </div>
                      </CardContent>
        </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No jobs available</h3>
                  <p className="text-muted-foreground mb-4">Add jobs to match with candidates</p>
                  <Link href="/jobs/new">
                    <Button>
                      <Briefcase className="mr-2 h-4 w-4" />
                      Add Job
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
        </Card>
      </section>

      {/* Stats */}
      <section className="container pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categoryStats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categoryStats.active}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Not to Moving Forward</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categoryStats.notToForward}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Archived</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categoryStats.archived}</div>
            </CardContent>
          </Card>
        </div>
      </section>
      
      {/* Filters and Search */}
      <section className="container pb-8" ref={candidatesSectionRef}>
        <Card>
          <CardHeader>
            <CardTitle>Candidates</CardTitle>
            <CardDescription>
              {selectedJob ? (
                <div className="flex items-center">
                  <span>Showing candidates matching job: </span>
                  <Badge className="ml-2">{selectedJob.title}</Badge>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="ml-2 h-8 px-2" 
                    onClick={() => {
                      setSelectedJob(null)
                      router.push('/candidates')
                    }}
                  >
                    <XCircle className="h-4 w-4" />
                    <span className="ml-1">Clear</span>
                  </Button>
                </div>
              ) : (
                <span>Browse and filter all candidates</span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by name, skills, or company..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full md:w-[180px]">
                    <Filter className="mr-2 h-4 w-4" />
                    {filterStatus === 'all' ? 'All Status' : 
                     filterStatus === 'active' ? 'Active' : 
                     filterStatus === 'not-to-forward' ? 'Not to Forward' : 
                     'Archived'}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleStatusFilter('all')}>
                    All Status
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusFilter('active')}>
                    Active
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusFilter('not-to-forward')}>
                    Not to Forward
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusFilter('archived')}>
                    Archived
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <Tabs 
              value={tabValue}
              onValueChange={(val) => {
                setTabValue(val as 'all' | 'active' | 'archived' | 'not-to-forward')
                if (val === 'all' || val === 'active' || val === 'archived' || val === 'not-to-forward') {
                  setFilterStatus(val as 'all' | 'active' | 'archived' | 'not-to-forward')
                }
              }}
            >
              <TabsList className="mb-4 flex flex-wrap gap-2">
                <TabsTrigger value="all">
                  All Candidates
                  <Badge variant="secondary" className="ml-2">{allCount}</Badge>
                </TabsTrigger>
                <TabsTrigger value="active">
                  Active
                  <Badge variant="secondary" className="ml-2">{activeCount}</Badge>
                </TabsTrigger>
                <TabsTrigger value="not-to-forward">
                  Not to Forward
                  <Badge className="ml-2 bg-red-50 text-red-600 border border-red-200">{notToForwardCount}</Badge>
                </TabsTrigger>
                <TabsTrigger value="archived">
                  Archived
                  <Badge variant="secondary" className="ml-2">{archivedCount}</Badge>
                </TabsTrigger>

              </TabsList>
              
              <TabsContent value="all">
                {filteredCandidates.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCandidates.map((candidate: any) => (
                      <CandidateCard 
                        key={candidate.id} 
                        candidate={candidate}
                        matchScore={selectedJob ? calculateMatchScore(candidate, selectedJob) : undefined}
                        selectedJob={selectedJob || undefined}
                        onStatusChange={handleStatusChange}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No candidates found</h3>
                    <p className="text-muted-foreground mb-4">Try adjusting your filters or upload new resumes</p>
                    <Link href="/upload">
                      <Button>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Resume
                      </Button>
                    </Link>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="active">
                {activeCandidatesList.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeCandidatesList.map((candidate: any) => (
                      <CandidateCard 
                        key={candidate.id} 
                        candidate={candidate}
                        matchScore={selectedJob ? calculateMatchScore(candidate, selectedJob) : undefined}
                        selectedJob={selectedJob || undefined}
                        onStatusChange={handleStatusChange}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No active candidates</h3>
                    <p className="text-muted-foreground mb-4">Try adjusting your search or upload new resumes</p>
                    <Link href="/upload">
                      <Button>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Resume
                      </Button>
                    </Link>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="not-to-forward">
                {notToForwardCandidatesList.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {notToForwardCandidatesList.map((candidate: any) => (
                      <CandidateCard 
                        key={candidate.id} 
                        candidate={candidate}
                        matchScore={selectedJob ? calculateMatchScore(candidate, selectedJob) : undefined}
                        selectedJob={selectedJob || undefined}
                        onStatusChange={handleStatusChange}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No candidates marked Not to Moving Forward</h3>
                    <p className="text-muted-foreground mb-4">Try adjusting your search or upload new resumes</p>
                    <Link href="/upload">
                      <Button>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Resume
                      </Button>
                    </Link>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="archived">
                {archivedCandidatesList.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {archivedCandidatesList.map((candidate: any) => (
                      <CandidateCard 
                        key={candidate.id} 
                        candidate={candidate}
                        matchScore={selectedJob ? calculateMatchScore(candidate, selectedJob) : undefined}
                        selectedJob={selectedJob || undefined}
                        onStatusChange={handleStatusChange}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No archived candidates</h3>
                    <p className="text-muted-foreground mb-4">Try adjusting your search or upload new resumes</p>
                    <Link href="/upload">
                      <Button>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Resume
                      </Button>
                    </Link>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
