"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/Navigation"
import { Footer } from "@/components/Footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Brain,
  BarChart3,
  Clock
} from "lucide-react"
import { parseResume, type Candidate } from "@/lib/ai-parser"

export default function UploadPage() {
  const router = useRouter()
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [error, setError] = useState<string | null>(null)
  const [currentFileIndex, setCurrentFileIndex] = useState(0)
  const [isBulkMode, setIsBulkMode] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileUpload(files)
    }
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileUpload(Array.from(files))
    }
  }

  const handleFileUpload = async (files: File[]) => {
    // Validate files
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    const validFiles = files.filter(file => {
      if (!allowedTypes.includes(file.type)) {
        setError(`File ${file.name} is not a PDF or DOCX file`)
        return false
      }
      if (file.size > 10 * 1024 * 1024) {
        setError(`File ${file.name} is too large (max 10MB)`)
        return false
      }
      return true
    })

    if (validFiles.length === 0) {
      return
    }

    setUploadedFiles(validFiles)
    setError(null)
    setIsProcessing(true)
    setProgress(0)
    setCandidates([])
    setCurrentFileIndex(0)
    setIsBulkMode(validFiles.length > 1)

    try {
      const processedCandidates: Candidate[] = []
      
      for (let i = 0; i < validFiles.length; i++) {
        setCurrentFileIndex(i)
        const file = validFiles[i]
        
        // Update progress
        const baseProgress = (i / validFiles.length) * 100
        setProgress(baseProgress)
        
        try {
          const result = await parseResume(file)
          processedCandidates.push(result)
          
          // Update progress for current file
          const fileProgress = ((i + 1) / validFiles.length) * 100
          setProgress(fileProgress)
        } catch (err) {
          console.error(`Error processing file ${file.name}:`, err)
          // Continue with other files even if one fails
        }
      }
      
      setProgress(100)
      setCandidates(processedCandidates)
      
      // Store in localStorage for demo purposes
      const existingCandidates = JSON.parse(localStorage.getItem('candidates') || '[]')
      existingCandidates.push(...processedCandidates)
      localStorage.setItem('candidates', JSON.stringify(existingCandidates))
      
      setTimeout(() => {
        router.push('/candidates')
      }, 1500)
    } catch (err) {
      setError('Failed to process resumes. Please try again.')
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">      
      {/* Hero Section */}
      <section className="container py-16 md:py-24">
        <div className="mx-auto max-w-4xl text-center space-y-8">
          <div className="inline-block animate-fade-in">
            <span className="px-4 py-1.5 text-sm font-medium bg-primary/10 text-primary rounded-full border border-primary/20">
              🤖 AI-Powered Analysis
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Upload Resume{isBulkMode ? 's' : ''} for
            <br />
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              AI Analysis
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Drag and drop your resume files or click to browse. Our AI will extract skills, 
            experience, and candidate information automatically. Supports bulk upload of multiple files.
          </p>
        </div>
      </section>

      {/* Upload Section */}
      <section className="container pb-24">
        <div className="mx-auto max-w-4xl">
          {!isProcessing && candidates.length === 0 && (
            <Card className="hover-scale">
              <CardHeader>
                <CardTitle className="text-center">Upload Resume</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                    isDragOver 
                      ? 'border-primary bg-primary/5' 
                      : 'border-muted-foreground/25 hover:border-primary/50'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="space-y-4">
                    <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Upload className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Drop your resume files here</h3>
                      <p className="text-muted-foreground">
                        or click to browse files (supports multiple files)
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <input
                        type="file"
                        accept=".pdf,.docx"
                        onChange={handleFileInput}
                        className="hidden"
                        id="file-upload"
                        multiple
                      />
                      <label htmlFor="file-upload">
                        <Button asChild>
                          <span>Choose Files</span>
                        </Button>
                      </label>
                      <p className="text-sm text-muted-foreground self-center">
                        Supports PDF and DOCX files up to 10MB each
                      </p>
                    </div>
                  </div>
                </div>
                
                {error && (
                  <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span>{error}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {isProcessing && (
            <Card className="hover-scale">
              <CardHeader>
                <CardTitle className="text-center flex items-center justify-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  {isBulkMode ? 'Analyzing Resumes' : 'Analyzing Resume'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>
                      {isBulkMode 
                        ? `Processing file ${currentFileIndex + 1} of ${uploadedFiles.length}: ${uploadedFiles[currentFileIndex]?.name}`
                        : `Processing ${uploadedFiles[0]?.name}`
                      }
                    </span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
                
                {isBulkMode && (
                  <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">
                      {candidates.length} of {uploadedFiles.length} files processed successfully
                    </p>
                    <div className="flex justify-center gap-1">
                      {uploadedFiles.map((_, index) => (
                        <div
                          key={index}
                          className={`w-2 h-2 rounded-full ${
                            index < currentFileIndex 
                              ? 'bg-green-500' 
                              : index === currentFileIndex 
                                ? 'bg-primary' 
                                : 'bg-muted'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="grid md:grid-cols-3 gap-4 text-center">
                  <div className="space-y-2">
                    <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-sm font-medium">Extracting Text</p>
                    <p className="text-xs text-muted-foreground">Reading resume content</p>
                  </div>
                  <div className="space-y-2">
                    <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Brain className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-sm font-medium">AI Analysis</p>
                    <p className="text-xs text-muted-foreground">Identifying skills & experience</p>
                  </div>
                  <div className="space-y-2">
                    <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <BarChart3 className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-sm font-medium">Generating Report</p>
                    <p className="text-xs text-muted-foreground">Creating candidate profile</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {candidates.length > 0 && (
            <Card className="hover-scale">
              <CardHeader>
                <CardTitle className="text-center flex items-center justify-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Analysis Complete
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-bold">
                    {candidates.length} {candidates.length === 1 ? 'Candidate' : 'Candidates'} Processed
                  </h3>
                  <p className="text-lg text-muted-foreground">
                    Successfully analyzed {candidates.length} resume{candidates.length === 1 ? '' : 's'}
                  </p>
                </div>
                
                {candidates.length === 1 ? (
                  // Single candidate view
                  <div className="space-y-4">
                    <div className="text-center space-y-2">
                      <h4 className="text-xl font-bold">{candidates[0].name}</h4>
                      <p className="text-muted-foreground">{candidates[0].jobTitle}</p>
                      <Badge variant="outline" className="text-sm">
                        {candidates[0].totalExperience} years experience
                      </Badge>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3">Top Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {candidates[0].skills.slice(0, 6).map((skill, index) => (
                            <Badge key={index} variant="secondary">
                              {skill.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-3">Skill Categories</h4>
                        <div className="space-y-2">
                          {Object.entries(
                            candidates[0].skills.reduce((acc, skill) => {
                              acc[skill.category] = (acc[skill.category] || 0) + 1
                              return acc
                            }, {} as Record<string, number>)
                          ).map(([category, count]) => (
                            <div key={category} className="flex justify-between text-sm">
                              <span className="capitalize">{category}</span>
                              <span className="text-muted-foreground">{count} skills</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Multiple candidates view
                  <div className="space-y-4">
                    <div className="grid gap-4">
                      {candidates.map((candidate, index) => (
                        <div key={candidate.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-semibold">{candidate.name}</h4>
                              <p className="text-sm text-muted-foreground">{candidate.jobTitle}</p>
                            </div>
                            <Badge variant="outline">
                              {candidate.totalExperience} years
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {candidate.skills.slice(0, 4).map((skill, skillIndex) => (
                              <Badge key={skillIndex} variant="secondary" className="text-xs">
                                {skill.name}
                              </Badge>
                            ))}
                            {candidate.skills.length > 4 && (
                              <Badge variant="outline" className="text-xs">
                                +{candidate.skills.length - 4} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    Redirecting to candidate dashboard...
                  </p>
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  )
}
