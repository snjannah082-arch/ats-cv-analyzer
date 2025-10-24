"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Navigation } from "@/components/Navigation"
import { Footer } from "@/components/Footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Progress } from "@/components/ui/progress"
import { 
  ArrowLeft, 
  Download, 
  User, 
  Briefcase, 
  Star, 
  TrendingUp,
  Calendar,
  MapPin,
  Mail,
  Phone,
  FileText,
  BarChart3,
  Brain,
  Award
} from "lucide-react"
import { type Candidate, getSkillsByCategory, getCategoryLabel } from "@/lib/ai-parser"

export default function CandidateDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [candidate, setCandidate] = useState<Candidate | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const candidates = JSON.parse(localStorage.getItem('candidates') || '[]')
    const foundCandidate = candidates.find((c: Candidate) => c.id === params.id)
    
    if (foundCandidate) {
      setCandidate(foundCandidate)
    }
    setLoading(false)
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-24">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!candidate) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-24">
          <Card>
            <CardContent className="p-12 text-center">
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Candidate not found</h3>
                  <p className="text-muted-foreground">
                    The candidate you're looking for doesn't exist.
                  </p>
                </div>
                <Button onClick={() => router.push('/candidates')}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Candidates
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const skillsByCategory = getSkillsByCategory(candidate.skills)
  const topSkills = candidate.skills
    .sort((a, b) => b.yearsOfExperience - a.yearsOfExperience)
    .slice(0, 5)

  return (
    <div className="min-h-screen bg-background">
      
      {/* Header */}
      <section className="container py-16">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={() => router.push('/candidates')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              {candidate.name}
            </h1>
            <p className="text-xl text-muted-foreground mt-2">{candidate.jobTitle}</p>
          </div>
          <Button onClick={() => {
            if (candidate.resumeUrl) {
              const url = candidate.resumeUrl
              const isPdf = url.startsWith('data:application/pdf') || url.toLowerCase().endsWith('.pdf')
              const isDocx = url.startsWith('data:application/vnd.openxmlformats-officedocument.wordprocessingml.document') || url.toLowerCase().endsWith('.docx')
              const ext = isPdf ? 'pdf' : isDocx ? 'docx' : 'pdf'
              const link = document.createElement('a')
              link.href = url
              link.download = `${candidate.name.replace(/\s+/g, '_')}_resume.${ext}`
              document.body.appendChild(link)
              link.click()
              document.body.removeChild(link)
            }
          }}>
            <Download className="mr-2 h-4 w-4" />
            Download Resume
          </Button>
        </div>

        {/* Contact Info & Summary */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Contact Info */}
          {(candidate.email || candidate.phone || candidate.location) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {candidate.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{candidate.email}</span>
                  </div>
                )}
                {candidate.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{candidate.phone}</span>
                  </div>
                )}
                {candidate.location && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{candidate.location}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Summary */}
          {candidate.summary && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Professional Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">{candidate.summary}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="hover-scale">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{candidate.totalExperience}</p>
                  <p className="text-sm text-muted-foreground">Years Experience</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover-scale">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Star className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{candidate.skills.length}</p>
                  <p className="text-sm text-muted-foreground">Total Skills</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover-scale">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {Math.round(candidate.skills.reduce((acc, skill) => acc + skill.confidence, 0) / candidate.skills.length * 100)}%
                  </p>
                  <p className="text-sm text-muted-foreground">Avg Confidence</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover-scale">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {new Date(candidate.uploadedAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Uploaded</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Tabs */}
      <section className="container pb-24">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="experience">Experience</TabsTrigger>
            <TabsTrigger value="education">Education</TabsTrigger>
            <TabsTrigger value="resume">Resume</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Top Skills</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Most relevant skills based on experience and confidence
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {topSkills.map((skill, index) => (
                    <div key={index} className="space-y-3 p-4 rounded-lg bg-muted/20 border">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-foreground">{skill.name}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {skill.yearsOfExperience} years
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {Math.round(skill.confidence * 100)}%
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Confidence</span>
                          <span>{Math.round(skill.confidence * 100)}%</span>
                        </div>
                        <Progress value={skill.confidence * 100} className="h-2" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Skill Categories</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Skills organized by category with counts
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(skillsByCategory).map(([category, skills]) => (
                      skills.length > 0 && (
                        <div key={category} className="space-y-3 p-4 rounded-lg bg-muted/20 border">
                          <div className="flex justify-between items-center">
                            <span className="font-medium capitalize text-foreground">{getCategoryLabel(category)}</span>
                            <Badge variant="outline">{skills.length} skills</Badge>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {skills.slice(0, 4).map((skill, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {skill.name}
                              </Badge>
                            ))}
                            {skills.length > 4 && (
                              <Badge variant="outline" className="text-xs">
                                +{skills.length - 4} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="skills" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Skills by Category</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Skills are organized by category with experience levels and confidence scores
                </p>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" className="space-y-4">
                  {Object.entries(skillsByCategory).map(([category, skills]) => (
                    skills.length > 0 && (
                      <AccordionItem key={category} value={category} className="border rounded-lg px-6">
                        <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline py-4">
                          <div className="flex items-center gap-3">
                            <span>{getCategoryLabel(category)}</span>
                            <Badge variant="secondary" className="ml-2">
                              {skills.length} skills
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4 pb-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            {skills.map((skill, index) => (
                              <div key={index} className="space-y-3 p-4 rounded-lg bg-muted/20 border">
                                <div className="flex justify-between items-center">
                                  <span className="font-medium text-foreground">{skill.name}</span>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs">
                                      {skill.yearsOfExperience} years
                                    </Badge>
                                    <Badge variant="secondary" className="text-xs">
                                      {Math.round(skill.confidence * 100)}%
                                    </Badge>
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>Confidence</span>
                                    <span>{Math.round(skill.confidence * 100)}%</span>
                                  </div>
                                  <Progress value={skill.confidence * 100} className="h-2" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="experience" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Work Experience</CardTitle>
              </CardHeader>
              <CardContent>
                {candidate.experience && candidate.experience.length > 0 ? (
                  <div className="space-y-6">
                    {candidate.experience.map((exp, index) => (
                      <div key={index} className="border-l-4 border-primary/20 pl-6 pb-6 last:pb-0">
                        <div className="space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div>
                              <h4 className="text-lg font-semibold text-foreground">{exp.position}</h4>
                              <p className="text-base text-primary font-medium">{exp.company}</p>
                            </div>
                            {exp.duration && (
                              <Badge variant="outline" className="w-fit">
                                {exp.duration}
                              </Badge>
                            )}
                          </div>
                          {exp.description && (
                            <div className="mt-3">
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {exp.description}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Briefcase className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No Work Experience Found</h3>
                    <p className="text-sm">Work experience information could not be extracted from the resume.</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Experience Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-4">Experience Distribution</h4>
                    <div className="space-y-3">
                      {Object.entries(skillsByCategory).map(([category, skills]) => (
                        skills.length > 0 && (
                          <div key={category} className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="capitalize">{category}</span>
                              <span>{skills.length} skills</span>
                            </div>
                            <div className="flex gap-1">
                              {skills.map((skill, index) => (
                                <div
                                  key={index}
                                  className="h-2 bg-primary rounded"
                                  style={{ 
                                    width: `${(skill.yearsOfExperience / Math.max(...skills.map(s => s.yearsOfExperience))) * 100}%` 
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-4">Confidence Levels</h4>
                    <div className="space-y-3">
                      {['High (90%+)', 'Medium (70-89%)', 'Low (<70%)'].map((level, index) => {
                        const count = candidate.skills.filter(skill => {
                          const confidence = skill.confidence * 100
                          if (index === 0) return confidence >= 90
                          if (index === 1) return confidence >= 70 && confidence < 90
                          return confidence < 70
                        }).length
                        
                        return (
                          <div key={level} className="flex justify-between items-center">
                            <span className="text-sm">{level}</span>
                            <Badge variant="outline">{count}</Badge>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="education" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Education</CardTitle>
              </CardHeader>
              <CardContent>
                {candidate.education && candidate.education.length > 0 ? (
                  <div className="space-y-4">
                    {candidate.education.map((edu, index) => (
                      <div key={index} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Award className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{edu}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Award className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No Education Information Found</h3>
                    <p className="text-sm">Education information could not be extracted from the resume.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resume" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Resume Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 border rounded-lg">
                    <FileText className="h-8 w-8 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium">Resume File</p>
                      <p className="text-sm text-muted-foreground">
                        Uploaded on {new Date(candidate.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button variant="outline" onClick={() => {
                      if (candidate.resumeUrl) {
                        const url = candidate.resumeUrl
                        const isPdf = url.startsWith('data:application/pdf') || url.toLowerCase().endsWith('.pdf')
                        const isDocx = url.startsWith('data:application/vnd.openxmlformats-officedocument.wordprocessingml.document') || url.toLowerCase().endsWith('.docx')
                        const ext = isPdf ? 'pdf' : isDocx ? 'docx' : 'pdf'
                        const link = document.createElement('a')
                        link.href = url
                        link.download = `${candidate.name.replace(/\s+/g, '_')}_resume.${ext}`
                        document.body.appendChild(link)
                        link.click()
                        document.body.removeChild(link)
                      }
                    }}>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                  
                  <div className="text-center py-12 bg-muted/30 rounded-lg">
                    <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Resume preview would be displayed here
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      In a real implementation, you would integrate with PDF.js or similar
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>
      
    </div>
  )
}
