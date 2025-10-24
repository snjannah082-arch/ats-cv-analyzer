export interface Skill {
  name: string
  category: 'frontend' | 'backend' | 'tools' | 'soft' | 'database' | 'cloud'
  yearsOfExperience: number
  confidence: number
}

export interface Candidate {
  id: string
  name: string
  jobTitle: string
  totalExperience: number
  skills: Skill[]
  resumeUrl: string
  uploadedAt: Date
  email?: string
  phone?: string
  location?: string
  summary?: string
  education?: string[]
  experience?: WorkExperience[]
  status?: 'active' | 'not-to-forward' | 'archived'
}

export interface WorkExperience {
  company: string
  position: string
  duration: string
  description: string
}

// Extract text from PDF using pdfjs-dist
async function extractTextFromPDF(file: File): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist')
  
  // Set worker source
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
  
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  let fullText = ''
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const textContent = await page.getTextContent()
    // Group items by their Y position to reconstruct lines
    const lineMap: Record<number, string[]> = {}
    for (const item of textContent.items as any[]) {
      const str = (item.str || '').trim()
      if (!str) continue
      const y = Math.round(item.transform?.[5] ?? 0)
      // Merge very close Y positions into same line (tolerance 2)
      const keys = Object.keys(lineMap).map(k => parseInt(k, 10))
      let targetY = y
      for (const k of keys) {
        if (Math.abs(k - y) <= 2) { targetY = k; break }
      }
      if (!lineMap[targetY]) lineMap[targetY] = []
      lineMap[targetY].push(str)
    }
    const sortedY = Object.keys(lineMap).map(n => parseInt(n, 10)).sort((a, b) => b - a) // top to bottom
    const lines = sortedY.map(y => lineMap[y].join(' '))
    fullText += lines.join('\n') + '\n'
  }
  
  return fullText
}

// Extract text from DOCX using mammoth
async function extractTextFromDOCX(file: File): Promise<string> {
  const mammoth = await import('mammoth')
  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth.extractRawText({ arrayBuffer })
  return result.value
}

// Extract text from file based on type
async function extractTextFromFile(file: File): Promise<string> {
  if (file.type === 'application/pdf') {
    return await extractTextFromPDF(file)
  } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return await extractTextFromDOCX(file)
  } else {
    throw new Error('Unsupported file type')
  }
}

// AI-powered resume parsing function
async function extractNameHint(file: File): Promise<string | undefined> {
  if (file.type !== 'application/pdf') return undefined
  const pdfjsLib = await import('pdfjs-dist')
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const page = await pdf.getPage(1)
  const textContent = await page.getTextContent()
  const lines: Record<number, { text: string; maxFont: number }> = {}
  for (const item of textContent.items as any[]) {
    const y = Math.round(item.transform?.[5] ?? 0)
    const fontSize = Math.abs(item.transform?.[0] ?? 0) || Math.abs(item.transform?.[3] ?? 0)
    const str = (item.str || '').trim()
    if (!str) continue
    if (!lines[y]) lines[y] = { text: '', maxFont: 0 }
    lines[y].text += (lines[y].text ? ' ' : '') + str
    lines[y].maxFont = Math.max(lines[y].maxFont, fontSize)
  }
  const candidates = Object.values(lines)
    .sort((a, b) => b.maxFont - a.maxFont)
    .map(l => l.text.trim())

  const invalid = (s: string) => s.length > 60 || s.includes('@') || s.toLowerCase().includes('summary') || s.toLowerCase().includes('experience') || s.toLowerCase().includes('education') || s.toLowerCase().includes('skills') || s.toLowerCase().includes('contact')
  for (const text of candidates) {
    if (invalid(text)) continue
    const words = text.split(/\s+/).filter(Boolean)
    if (words.length >= 1 && words.length <= 5) {
      return text
    }
  }
  return undefined
}
async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (e) => reject(e)
    reader.readAsDataURL(file)
  })
}
export async function parseResume(file: File): Promise<Candidate> {
  try {
    // Extract text from the file
    const text = await extractTextFromFile(file)
    const nameHint = await extractNameHint(file)
    // Generate unique ID
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    // Parse the extracted text using AI-like logic
    const parsedData = await parseResumeText(text, nameHint)
    return {
      id,
      name: parsedData.name || 'Unknown Candidate',
      jobTitle: parsedData.jobTitle || 'Software Developer',
      totalExperience: parsedData.totalExperience || 0,
      skills: parsedData.skills || [],
      resumeUrl: await fileToDataUrl(file),
      uploadedAt: new Date(),
      email: parsedData.email,
      phone: parsedData.phone,
      location: parsedData.location,
      summary: parsedData.summary,
      education: parsedData.education,
      experience: parsedData.experience,
      status: 'active'
    }
  } catch (error) {
    console.error('Error parsing resume:', error)
    // Return a fallback candidate if parsing fails
    return createFallbackCandidate(file)
  }
}

// Parse resume text using pattern matching and AI-like logic
async function parseResumeText(text: string, nameHint?: string): Promise<Partial<Candidate>> {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
  // Extract job title terlebih dahulu agar penentuan nama bisa melihat kedekatan
  const jobTitle = extractJobTitle(lines)
  // Extract contact information
  const email = extractEmail(text)
  const phone = extractPhone(text)
  const location = extractLocation(lines)
  // Tentukan index baris yang memuat jobTitle dan kontak
  const jobIndex = lines.findIndex(l => l.includes(jobTitle))
  const contactIndex = (() => {
    const emailIdx = email ? lines.findIndex(l => l.includes(email) || l.toLowerCase().includes('email')) : -1
    const phoneIdx = phone ? lines.findIndex(l => l.includes(phone) || l.toLowerCase().includes('phone')) : -1
    if (emailIdx >= 0 && phoneIdx >= 0) return Math.min(emailIdx, phoneIdx)
    return emailIdx >= 0 ? emailIdx : phoneIdx
  })()
  // Extract name dengan konteks dekat job title / kontak
  const name = extractName(lines, nameHint, { jobTitle, jobIndex, contactIndex })

  // ===== ATS section-based parsing =====
  const normalizedLines = normalizeATSLines(text)
  const sections = detectATSSections(normalizedLines)

  // Skills
  let skills: Skill[] = []
  if (sections.skills) {
    skills = parseSkillsFromSection(normalizedLines, sections.skills.start, sections.skills.end)
  } else {
    skills = extractSkills(text)
  }

  // Experience
  let experience: WorkExperience[] = []
  if (sections.experience) {
    experience = parseExperienceFromSection(normalizedLines, sections.experience.start, sections.experience.end)
  } else {
    experience = extractWorkExperience(text)
  }

  // Education
  let education: string[] = []
  if (sections.education) {
    education = parseEducationFromSection(normalizedLines, sections.education.start, sections.education.end)
  } else {
    education = extractEducation(text)
  }

  // Total Experience: prioritise explicit then derive from section experience
  let totalExperience = calculateTotalExperience(text)
  if ((!totalExperience || totalExperience === 0) && experience.length) {
    const totalMonths = computeTotalExperienceMonths(experience)
    if (totalMonths > 0) {
      totalExperience = parseFloat((totalMonths / 12).toFixed(1))
    } else {
      // Rough derive from duration strings within parsed experience
      const years: number[] = []
      for (const exp of experience) {
        const m = exp.duration?.match(/(\d+)\s*years?/i)
        if (m) years.push(parseInt(m[1]))
      }
      if (years.length) totalExperience = Math.max(...years)
    }
  }

  // Extract summary
  const summary = extractSummary(text)
  return {
    name,
    jobTitle,
    totalExperience,
    skills,
    email,
    phone,
    location,
    summary,
    education,
    experience
  }
}

// Helper functions for text extraction
function extractName(lines: string[], nameHint?: string, ctx?: { jobTitle?: string; jobIndex?: number; contactIndex?: number }): string {
  const isSection = (s: string) => {
    const t = s.toLowerCase()
    return t.includes('summary') || t.includes('experience') || t.includes('education') || t.includes('skills') || t.includes('projects') || t.includes('contact')
  }
  const looksLikeName = (s: string) => {
    if (!s) return false
    if (s.length > 50) return false
    if (s.includes('@') || s.includes('http')) return false
    if (/\d/.test(s)) return false
    if (/[,:|]/.test(s)) return false
    if (isSection(s)) return false
    const words = s.split(/\s+/).filter(Boolean)
    if (words.length < 1 || words.length > 5) return false
    const commonJobWords = ['software','developer','engineer','manager','analyst','consultant','specialist','lead','senior','junior','architect','designer']
    if (words.some(w => commonJobWords.includes(w.toLowerCase()))) return false
    // proper/mixed case
    return words.every(w => /^[A-Za-z'.-]+$/.test(w))
  }
  // Prioritaskan baris di dekat job title
  if (ctx?.jobIndex !== undefined && ctx.jobIndex! >= 0) {
    for (let i = Math.max(0, ctx.jobIndex! - 3); i < ctx.jobIndex!; i++) {
      const cand = lines[i].trim()
      if (looksLikeName(cand)) return cand
    }
  }
  // Kedekatan dengan kontak (Email/Phone) — ambil baris di atasnya
  if (ctx?.contactIndex !== undefined && ctx.contactIndex! > 0) {
    for (let i = ctx.contactIndex! - 1; i >= Math.max(0, ctx.contactIndex! - 3); i--) {
      const cand = lines[i].trim()
      if (looksLikeName(cand)) return cand
    }
  }
  // Gunakan hint dari PDF hanya jika lolos validasi ketat
  if (nameHint && looksLikeName(nameHint)) {
    return nameHint
  }
  // Coba 5 baris awal yang bukan header
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const cand = lines[i].trim()
    if (looksLikeName(cand)) return cand
  }
  // Pencarian fallback dalam 20 baris pertama
  for (let i = 0; i < Math.min(20, lines.length); i++) {
    const cand = lines[i].trim()
    if (looksLikeName(cand)) return cand
  }
  return 'Unknown Candidate'
}

function extractEmail(text: string): string | undefined {
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/
  const match = text.match(emailRegex)
  return match ? match[0] : undefined
}

function extractPhone(text: string): string | undefined {
  // Support international formats (E.164) and common separators, including Indonesian numbers
  const patterns = [
    /\+?\d{1,3}[\s-]?\(?\d{1,4}\)?(?:[\s-]?\d{3,4}){2,4}/, // e.g. +62 812 9988 7766
    /phone[:\s]*([+()0-9\s-]{7,})/i, // capture after "Phone:"
    /\b0\d{2,3}[\s-]?\d{3,4}[\s-]?\d{3,4}\b/ // local formats
  ]
  for (const re of patterns) {
    const m = text.match(re)
    if (m) {
      return (m[1] || m[0]).trim()
    }
  }
  return undefined
}

function extractLocation(lines: string[]): string | undefined {
  // Look for location patterns
  for (const line of lines) {
    if (line.includes(',') && (line.includes('City') || line.includes('State') || 
        line.includes('Country') || /[A-Z]{2}/.test(line))) {
      return line
    }
  }
  return undefined
}

function extractJobTitle(lines: string[]): string {
  const jobTitleKeywords = ['Developer', 'Engineer', 'Manager', 'Analyst', 'Designer', 'Consultant', 'Specialist', 'Lead', 'Senior', 'Junior', 'Associate', 'Principal', 'Staff', 'Architect', 'Coordinator', 'Administrator', 'Executive', 'Officer', 'Representative', 'Assistant', 'Intern', 'Trainee']
  
  // Look for job titles in the first 10 lines
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const raw = lines[i]
    const line = raw.trim()
    
    // Skip empty lines and common headers
    if (!line || /summary|experience|education|skills|contact/i.test(line)) {
      continue
    }
    
    // Find earliest job keyword index to avoid preceding address text
    const indices = jobTitleKeywords
      .map(k => ({ k, idx: line.toLowerCase().indexOf(k.toLowerCase()) }))
      .filter(o => o.idx >= 0)
      .sort((a, b) => a.idx - b.idx)
    
    if (indices.length) {
      let title = line.slice(indices[0].idx)
      // Remove common suffixes that include company or separators
      title = title.replace(/\s*at\s+.*$/i, '') // "at Company"
      title = title.replace(/\s*(?:—|–|-)\s*.*$/i, '') // "- Company"
      title = title.replace(/\s*\|\s*.*$/i, '') // "| Company"
      title = title.replace(/\s*@\s*.*$/i, '') // "@ Company"
      // Collapse extra spaces and trim
      title = title.replace(/\s+/g, ' ').trim()
      // Sanity: keep reasonable length
      if (title.length >= 3 && title.length <= 80) return title
    }
  }
  
  // Fallback: look for any line that might contain a job title
  for (let i = 0; i < Math.min(15, lines.length); i++) {
    const line = lines[i].trim()
    if (
      line && line.length > 5 && line.length < 100 &&
      !/[\d@]/.test(line) && !/http/i.test(line) &&
      !/phone|email|summary|experience|education|skills/i.test(line)
    ) {
      const jobWords = ['developer','engineer','manager','analyst','designer','consultant','specialist','lead','senior','junior','associate','principal','staff','architect','coordinator','administrator','executive','officer','representative','assistant','intern','trainee']
      const indices = jobWords
        .map(k => ({ k, idx: line.toLowerCase().indexOf(k.toLowerCase()) }))
        .filter(o => o.idx >= 0)
        .sort((a, b) => a.idx - b.idx)
      if (indices.length) {
        let title = line.slice(indices[0].idx)
        title = title.replace(/\s*at\s+.*$/i, '')
        title = title.replace(/\s*(?:—|–|-)\s*.*$/i, '')
        title = title.replace(/\s*\|\s*.*$/i, '')
        title = title.replace(/\s*@\s*.*$/i, '')
        title = title.replace(/\s+/g, ' ').trim()
        return title
      }
    }
  }
  
  return 'Software Developer'
}

function extractSkills(text: string): Skill[] {
  const skillKeywords = {
    frontend: ['React', 'Vue', 'Angular', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'SASS', 'SCSS', 'Next.js', 'Nuxt.js', 'jQuery', 'Bootstrap', 'Tailwind'],
    backend: ['Node.js', 'Python', 'Java', 'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'Django', 'Flask', 'Express', 'Spring', 'Laravel', 'Rails', 'ASP.NET'],
    database: ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQLite', 'Oracle', 'SQL Server', 'DynamoDB', 'Cassandra', 'Elasticsearch', 'SQL'],
    cloud: ['AWS', 'Azure', 'GCP', 'Google Cloud', 'Docker', 'Kubernetes', 'Terraform', 'CloudFormation', 'Heroku', 'Vercel', 'Netlify'],
    tools: ['Git', 'GitHub', 'GitLab', 'Jenkins', 'CI/CD', 'Docker', 'Kubernetes', 'Terraform', 'Ansible', 'Jira', 'Confluence', 'Slack', 'VS Code', 'IntelliJ', 'Power BI', 'Tableau', 'Excel', 'HRIS', 'Figma', 'Design System', 'Prototyping', 'A/B Testing', 'Usability Testing'],
    soft: ['Leadership', 'Communication', 'Teamwork', 'Problem Solving', 'Project Management', 'Agile', 'Scrum', 'Mentoring', 'Public Speaking', 'Recruitment & Selection', 'Recruitment', 'Selection', 'Employee Relations', 'Talent Acquisition', 'People & Culture', 'Onboarding', 'Employer Branding', 'User Research']
  }
  
  const skills: Skill[] = []
  const textLower = text.toLowerCase()
  
  for (const [category, keywords] of Object.entries(skillKeywords)) {
    for (const keyword of keywords) {
      if (textLower.includes(keyword.toLowerCase())) {
        const years = calculateSkillExperience(text, keyword)
        const confidence = calculateSkillConfidence(text, keyword)
        
        skills.push({
          name: keyword,
          category: category as any,
          yearsOfExperience: years,
          confidence: confidence
        })
      }
    }
  }
  
  const uniqueSkills = skills.filter((skill, index, self) => 
    index === self.findIndex(s => s.name === skill.name)
  ).sort((a, b) => b.confidence - a.confidence)
  
  return uniqueSkills.slice(0, 15)
}

function calculateSkillExperience(text: string, skill: string): number {
  const skillLower = skill.toLowerCase()
  const textLower = text.toLowerCase()
  
  // Look for patterns like "3 years of React" or "React (3 years)" and bullets/colon variants
  const patterns = [
    new RegExp(`(\\d+)\\s*years?\\s*(?:of\\s*)?${skillLower}`, 'i'),
    new RegExp(`${skillLower}\\s*\\((\\d+)\\s*years?\\)`, 'i'),
    new RegExp(`${skillLower}\\s*(?:for\\s*)?(\\d+)\\s*years?`, 'i'),
    new RegExp(`${skillLower}\\s*[:\\-]\\s*(\\d+)\\s*years?`, 'i'), // e.g. Node.js: 6 years
    new RegExp(`[•\\-]\\s*${skillLower}\\s*[:]??\\s*(\\d+)\\s*years?`, 'i') // e.g. • Node.js: 6 years
  ]
  
  for (const pattern of patterns) {
    const match = textLower.match(pattern)
    if (match) {
      return parseInt(match[1])
    }
  }
  
  // Default experience based on skill frequency and context
  const frequency = (textLower.match(new RegExp(skillLower, 'g')) || []).length
  if (frequency >= 3) return 3
  if (frequency >= 2) return 2
  return 1
}

function calculateSkillConfidence(text: string, skill: string): number {
  const skillLower = skill.toLowerCase()
  const textLower = text.toLowerCase()
  
  let confidence = 0.5 // Base confidence
  
  // Increase confidence based on context
  if (textLower.includes(`${skillLower} experience`)) confidence += 0.2
  if (textLower.includes(`proficient in ${skillLower}`)) confidence += 0.2
  if (textLower.includes(`expert in ${skillLower}`)) confidence += 0.3
  if (textLower.includes(`skilled in ${skillLower}`)) confidence += 0.1
  
  // Increase confidence based on frequency
  const frequency = (textLower.match(new RegExp(skillLower, 'g')) || []).length
  confidence += Math.min(frequency * 0.1, 0.3)
  
  return Math.min(confidence, 1.0)
}

function calculateTotalExperience(text: string): number {
  const textLower = text.toLowerCase()
  
  // Look for total experience patterns
  const patterns = [
    /(\d+)\s*years?\s*(?:of\s*)?(?:total\s*)?experience/i,
    /experience:\s*(\d+)\s*years?/i,
    /(\d+)\s*years?\s*in\s*(?:software\s*)?development/i
  ]
  
  for (const pattern of patterns) {
    const match = textLower.match(pattern)
    if (match) {
      return parseInt(match[1])
    }
  }
  
  // Fallback: take maximum of any '(x years)' mentions without using matchAll
  const yearMentions: number[] = []
  const re = /(\d+)\s*years?/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(textLower)) !== null) {
    const n = parseInt(m[1])
    if (!isNaN(n)) yearMentions.push(n)
  }
  if (yearMentions.length) {
    return Math.max(...yearMentions)
  }
  
  // Calculate from work experience sections (rough estimate)
  const workExperience = extractWorkExperience(text)
  if (workExperience.length > 0) {
    return workExperience.length * 2 // Rough estimate
  }
  
  return 0
}

// Compute month differences between two dates described by month name and year
function monthsDiff(start: { month?: string; year: number }, end: { month?: string; year: number }): number {
  const monthIdx: Record<string, number> = {
    jan: 0, january: 0,
    feb: 1, february: 1,
    mar: 2, march: 2,
    apr: 3, april: 3,
    may: 4,
    jun: 5, june: 5,
    jul: 6, july: 6,
    aug: 7, august: 7,
    sep: 8, september: 8,
    oct: 9, october: 9,
    nov: 10, november: 10,
    dec: 11, december: 11,
  }
  const sMonth = start.month ? monthIdx[start.month.toLowerCase()] ?? 0 : 0
  const eMonth = end.month ? monthIdx[end.month.toLowerCase()] ?? 0 : 0
  return (end.year - start.year) * 12 + (eMonth - sMonth)
}

// Parse a duration string into total months
function parseDurationToMonths(duration?: string): number | null {
  if (!duration) return null
  const m1 = duration.match(/(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{4})\s*[-–]\s*(?:(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+)?(\d{4}|present|current)/i)
  if (m1) {
    const startMonth = m1[1]
    const startYear = parseInt(m1[2], 10)
    const endMonthCandidate = m1[3]
    const endYearStr = m1[4].toLowerCase()
    const now = new Date()
    const endYear = endYearStr === 'present' || endYearStr === 'current' ? now.getFullYear() : parseInt(m1[4], 10)
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    const endMonth = endMonthCandidate || monthNames[now.getMonth()]
    const months = monthsDiff({month: startMonth, year: startYear}, {month: endMonth, year: endYear})
    return Math.max(0, months)
  }
  const m2 = duration.match(/(\d{4})\s*[-–]\s*(\d{4}|present|current)/i)
  if (m2) {
    const startYear = parseInt(m2[1], 10)
    const endYearStr = m2[2].toLowerCase()
    const now = new Date()
    const endYear = endYearStr === 'present' || endYearStr === 'current' ? now.getFullYear() : parseInt(m2[2], 10)
    return Math.max(0, (endYear - startYear) * 12)
  }
  const yearsExplicit = duration.match(/(\d+)\s+years?/i)
  if (yearsExplicit) return parseInt(yearsExplicit[1], 10) * 12
  return null
}

// Sum all experience durations in months
function computeTotalExperienceMonths(items: WorkExperience[]): number {
  let total = 0
  for (const it of items) {
    const months = parseDurationToMonths(it.duration)
    if (months != null) total += months
  }
  return total
}

function extractWorkExperience(text: string): WorkExperience[] {
  const experience: WorkExperience[] = []
  const lines = text.split('\n').map(line => line.trim())
  
  let inExperienceSection = false
  let currentExperience: Partial<WorkExperience> = {}
  const jobWords = ['developer','engineer','manager','analyst','designer','consultant','specialist','lead','senior','junior','associate','principal','staff','architect','coordinator','administrator','executive','officer']
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    
    if (line.toLowerCase().includes('experience') || line.toLowerCase().includes('employment') || 
        line.toLowerCase().includes('work history') || line.toLowerCase().includes('professional experience')) {
      inExperienceSection = true
      continue
    }
    
    if (inExperienceSection && (line.toLowerCase().includes('education') || 
        line.toLowerCase().includes('skills') || line.toLowerCase().includes('projects') ||
        line.toLowerCase().includes('certifications') || line.toLowerCase().includes('awards'))) {
      inExperienceSection = false
      if (currentExperience.company && currentExperience.position) {
        experience.push(currentExperience as WorkExperience)
        currentExperience = {}
      }
      continue
    }
    
    if (inExperienceSection) {
      // Company — Position (em dash / hyphen)
      const companyDash = line.match(/^(.+?)\s+(?:—|–|-)\s+(.+)$/)
      if (companyDash) {
        const left = companyDash[1].trim()
        const right = companyDash[2].trim()
        const rightHasJob = jobWords.some(w => right.toLowerCase().includes(w))
        const leftHasJob = jobWords.some(w => left.toLowerCase().includes(w))
        if (rightHasJob && !leftHasJob) {
          if (currentExperience.company && currentExperience.position) experience.push(currentExperience as WorkExperience)
          currentExperience = {}
          currentExperience.company = left
          currentExperience.position = right
          continue
        }
      }
      
      // Header with parentheses duration (existing)
      const headerWithParen = line.match(/^(.+?)\s+(?:-|–)\s+(.+?)\s*\(([^)]+)\)\s*(?:•\s*(\d+)\s*years)?/i)
      if (headerWithParen) {
        if (currentExperience.company && currentExperience.position) {
          experience.push(currentExperience as WorkExperience)
        }
        currentExperience = {}
        currentExperience.position = headerWithParen[1].trim()
        currentExperience.company = headerWithParen[2].trim()
        currentExperience.duration = headerWithParen[3].trim()
        continue
      }
      
      // Position at Company (existing)
      const roleCompany = line.match(/^(.+?)\s+(?:at|@|-|\|)\s+(.+)$/i)
      if (roleCompany) {
        if (currentExperience.company && currentExperience.position) experience.push(currentExperience as WorkExperience)
        currentExperience = {}
        currentExperience.position = roleCompany[1].trim()
        currentExperience.company = roleCompany[2].trim().replace(/\s*\(([^)]+)\).*/, '')
        continue
      }
      
      // Capture month-year ranges possibly on next line
      const monthRange = line.match(/(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{4})\s*[-–]\s*(?:(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+)?(\d{4}|present|current)/i)
      if (monthRange) {
        const startMonth = monthRange[1]
        const startYear = monthRange[2]
        const endMonth = monthRange[3]
        const endYear = monthRange[4]
        currentExperience.duration = `${startMonth} ${startYear} - ${endMonth ? endMonth + ' ' : ''}${endYear}`
        continue
      }
      
      const durationMatch = line.match(/(\d{4})\s*[-–]\s*(\d{4}|present|current)/i)
      if (durationMatch) {
        currentExperience.duration = `${durationMatch[1]} - ${durationMatch[2]}`
      }
      
      // Description bullets
      if (line.length > 20 && !line.includes('@') && !line.match(/\d{4}/) && 
          (line.startsWith('-') || line.startsWith('•') || line.startsWith('*') || 
           line.startsWith('◦') || line.startsWith('▪') || line.startsWith('▫'))) {
        const cleanLine = line.replace(/^[-•*◦▪▫]\s*/, '').trim()
        if (cleanLine.length > 10) {
          currentExperience.description = (currentExperience.description || '') + cleanLine + ' '
        }
      }
    }
  }
  
  if (currentExperience.company && currentExperience.position) {
    experience.push(currentExperience as WorkExperience)
  }
  
  return experience
}

function extractEducation(text: string): string[] {
  const education: string[] = []
  const lines = text.split('\n').map(line => line.trim())
  
  let inEducationSection = false
  
  for (const line of lines) {
    if (line.toLowerCase().includes('education') || line.toLowerCase().includes('academic') || line.toLowerCase().includes('pendidikan')) {
      inEducationSection = true
      continue
    }
    
    if (inEducationSection) {
      if (
        /(University|College|Institute|Center|School)/i.test(line) ||
        /(Bachelor|Master|PhD|Degree|Diploma|Certificate|Certification)/i.test(line) ||
        /B\.?Sc\.?/i.test(line) || /M\.?Sc\.?/i.test(line) ||
        /Universitas/i.test(line) || /Sarjana/i.test(line) || /S[123]/.test(line)
      ) {
        education.push(line)
      }
    }
  }
  
  return education
}

function extractSummary(text: string): string | undefined {
  const lines = text.split('\n').map(line => line.trim())
  
  // Look for summary/objective section
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.toLowerCase().includes('summary') || line.toLowerCase().includes('objective') || 
        line.toLowerCase().includes('profile') || line.toLowerCase().includes('about')) {
      // Get the next few lines as summary
      const summaryLines = lines.slice(i + 1, i + 4).filter(l => l.length > 10)
      if (summaryLines.length > 0) {
        return summaryLines.join(' ')
      }
    }
  }
  
  return undefined
}

// Fallback candidate creation
function createFallbackCandidate(file: File): Candidate {
  return {
    id: Date.now().toString(),
    name: 'Unknown Candidate',
    jobTitle: 'Software Developer',
    totalExperience: 0,
    skills: [
      { name: 'Problem Solving', category: 'soft', yearsOfExperience: 1, confidence: 0.5 },
      { name: 'Communication', category: 'soft', yearsOfExperience: 1, confidence: 0.5 }
    ],
    resumeUrl: URL.createObjectURL(file),
    uploadedAt: new Date(),
    status: 'active'
  }
}

export function getSkillsByCategory(skills: Skill[]) {
  const categories = {
    frontend: skills.filter(skill => skill.category === 'frontend'),
    backend: skills.filter(skill => skill.category === 'backend'),
    tools: skills.filter(skill => skill.category === 'tools'),
    soft: skills.filter(skill => skill.category === 'soft'),
    database: skills.filter(skill => skill.category === 'database'),
    cloud: skills.filter(skill => skill.category === 'cloud')
  }
  
  return categories
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    frontend: 'Frontend Skills',
    backend: 'Backend Skills',
    tools: 'Development Tools',
    soft: 'Soft Skills',
    database: 'Database Skills',
    cloud: 'Cloud Platforms'
  }
  
  return labels[category] || category
}

function normalizeATSLines(text: string): string[] {
  return text
    .replace(/[\r\f]/g, '\n')
    .replace(/[•*\u2022\u2023\u25E6\u25AA\u25AB]/g, '-')
    .replace(/[\u00A6\|]/g, ' | ') // normalize broken bar/pipe separators
    .split('\n')
    .map(l => l.replace(/\s+/g, ' ').trim())
    .filter(l => l.length > 0)
}

interface SectionRange { start: number; end: number }
interface ATSSections {
  skills?: SectionRange
  experience?: SectionRange
  education?: SectionRange
  projects?: SectionRange
  contact?: SectionRange
}

function detectATSSections(lines: string[]): ATSSections {
  const headerRegexes = [
    { key: 'skills', re: /^(top\s+skills|skills?|technical skills?|keahlian)/i },
    { key: 'experience', re: /^(experience|work\s+history|employment|professional\s+experience|pengalaman)/i },
    { key: 'education', re: /^(education|academic|pendidikan)/i },
    { key: 'projects', re: /^(projects?|portfolio|proyek)/i },
    { key: 'contact', re: /^(contact|contacts?|kontak)/i }
  ] as const

  const indices: Record<string, number> = {}
  lines.forEach((l, idx) => {
    for (const h of headerRegexes) {
      if (h.re.test(l)) {
        indices[h.key] = idx
      }
    }
  })

  const keys = Object.keys(indices)
  const ranges: ATSSections = {}
  for (const key of keys) {
    const start = indices[key]
    const nextStarts = Object.values(indices).filter(v => v > start).sort((a, b) => a - b)
    const end = (nextStarts.length ? nextStarts[0] - 1 : lines.length - 1)
    ;(ranges as any)[key] = { start, end }
  }
  return ranges
}

function parseSkillsFromSection(lines: string[], start: number, end: number): Skill[] {
  const slice = lines.slice(start + 1, end + 1)
  const text = slice.join('\n')
  const base = extractSkills(text)
  const map = new Map(base.map(s => [s.name.toLowerCase(), s]))
  for (const line of slice) {
    const m = line.match(/([A-Za-z0-9.+#\-\s/]+?)\s*[:\-]\s*(\d+)\s*years?/i)
    if (m) {
      const skillName = m[1].trim()
      const years = parseInt(m[2])
      const key = skillName.toLowerCase()
      const found = map.get(key)
      if (found) {
        found.yearsOfExperience = Math.max(found.yearsOfExperience, years)
        found.confidence = Math.min(1, found.confidence + 0.2)
      } else {
        base.push({ name: skillName, category: 'tools', yearsOfExperience: years, confidence: 0.6 })
        map.set(key, base[base.length - 1])
      }
    }
  }
  return base
}

function parseExperienceFromSection(lines: string[], start: number, end: number): WorkExperience[] {
  const slice = lines.slice(start + 1, end + 1)
  const exp: WorkExperience[] = []
  let current: Partial<WorkExperience> = {}
  const jobWords = ['developer','engineer','manager','analyst','designer','consultant','specialist','lead','senior','junior','associate','principal','staff','architect','coordinator','administrator','executive','officer']
  for (const line of slice) {
    const companyDash = line.match(/^(.+?)\s+(?:—|–|-)\s+(.+)$/)
    if (companyDash) {
      const left = companyDash[1].trim()
      const right = companyDash[2].trim()
      const rightHasJob = jobWords.some(w => right.toLowerCase().includes(w))
      const leftHasJob = jobWords.some(w => left.toLowerCase().includes(w))
      if (rightHasJob && !leftHasJob) {
        if (current.company && current.position) exp.push(current as WorkExperience)
        current = {}
        current.company = left
        current.position = right
        continue
      }
    }
    const headerWithParen = line.match(/^(.+?)\s+(?:-|–)\s+(.+?)\s*\(([^)]+)\)\s*(?:•\s*(\d+)\s*years)?/i)
    if (headerWithParen) {
      if (current.company && current.position) exp.push(current as WorkExperience)
      current = {}
      current.position = headerWithParen[1].trim()
      current.company = headerWithParen[2].trim()
      current.duration = headerWithParen[3].trim()
      continue
    }
    const durationParen = line.match(/\(([^)]+\d{4}[^)]*)\)/)
    if (durationParen) current.duration = durationParen[1]
    const monthRange = line.match(/(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{4})\s*[-–]\s*(?:(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+)?(\d{4}|present|current)/i)
    if (monthRange) {
      const startMonth = monthRange[1]
      const startYear = monthRange[2]
      const endMonth = monthRange[3]
      const endYear = monthRange[4]
      current.duration = `${startMonth} ${startYear} - ${endMonth ? endMonth + ' ' : ''}${endYear}`
      continue
    }
    const durationMatch = line.match(/(\d{4})\s*[-–]\s*(\d{4}|present|current)/i)
    if (durationMatch) current.duration = `${durationMatch[1]} - ${durationMatch[2]}`

    const roleCompany = line.match(/^(.+?)\s+(?:at|@|-|\|)\s+(.+)$/i)
    if (roleCompany) {
      if (current.company && current.position) exp.push(current as WorkExperience)
      current = {}
      current.position = roleCompany[1].trim()
      current.company = roleCompany[2].trim().replace(/\s*\(([^)]+)\).*/, '')
      continue
    }

    if (line.length > 20 && !line.includes('@') && !line.match(/\d{4}/) &&
        (line.startsWith('-') || line.startsWith('•'))) {
      const clean = line.replace(/^[-•]\s*/, '').trim()
      if (clean.length > 10) {
        current.description = (current.description || '') + clean + ' '
      }
    }
  }
  if (current.company && current.position) exp.push(current as WorkExperience)
  return exp
}

function parseEducationFromSection(lines: string[], start: number, end: number): string[] {
  const slice = lines.slice(start + 1, end + 1)
  const edu: string[] = []
  for (const line of slice) {
    if (/University|College|Institute|Bachelor|Master|PhD|Degree|Diploma/i.test(line) || /B\.?Sc\.?|M\.?Sc\.?/i.test(line) || /Universitas|Sarjana|S[123]/i.test(line)) {
      edu.push(line)
    }
  }
  return edu
}
