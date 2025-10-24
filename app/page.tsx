import { Navigation } from "@/components/Navigation"
import { Footer } from "@/components/Footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { 
  FileText, 
  Brain, 
  BarChart3, 
  Users, 
  Zap, 
  Shield, 
  CheckCircle, 
  Upload,
  Search,
  TrendingUp
} from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">      
      {/* Hero Section */}
      <section className="container py-24 md:py-32">
        <div className="mx-auto max-w-4xl text-center space-y-8">
          <div className="inline-block animate-fade-in">
            <span className="px-4 py-1.5 text-sm font-medium bg-primary/10 text-primary rounded-full border border-primary/20">
              🤖 AI-Powered Analysis
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Smart Resume Analyzer
            <br />
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              For Modern Recruiters
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Upload candidate resumes and instantly extract skills, experience levels, and insights. 
            No manual parsing, no guesswork - just AI-powered precision.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <Link href="/upload">
              <Button size="lg" className="text-lg px-8 py-6">
                <Upload className="mr-2 h-5 w-5" />
                Upload Resume - It's Free
              </Button>
            </Link>
            <Link href="/candidates">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                <Users className="mr-2 h-5 w-5" />
                View Candidates
              </Button>
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-6 pt-8 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span>No credit card</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span>AI-powered extraction</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span>Unlimited uploads</span>
            </div>
          </div>
        </div>
      </section>

      {/* What is ATS CV */}
      <section className="border-y bg-muted/30 py-24">
        <div className="container">
          <div className="mx-auto max-w-4xl text-center space-y-6">
            <h2 className="text-3xl md:text-5xl font-bold">What is ATS CV?</h2>
            <p className="text-xl text-muted-foreground">
              ATS CV is an intelligent resume analysis platform that uses AI to automatically extract 
              candidate information, skills, and experience levels from uploaded resumes.
            </p>
            <p className="text-lg text-muted-foreground">
              Simply upload PDF or DOCX files, and our AI instantly parses candidate data, 
              categorizes skills, estimates years of experience, and provides confidence scores 
              for each extracted skill.
            </p>
          </div>
        </div>
      </section>

      {/* Why Use ATS CV */}
      <section className="container py-24">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-5xl font-bold">Why Use ATS CV?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform your recruitment process with AI-powered resume analysis
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="hover-scale">
            <CardHeader>
              <Brain className="h-12 w-12 text-primary mb-4" />
              <CardTitle>AI-Powered Extraction</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Advanced AI algorithms automatically extract skills, experience, and candidate information with high accuracy.
              </p>
            </CardContent>
          </Card>
          <Card className="hover-scale">
            <CardHeader>
              <BarChart3 className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Experience Mapping</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Get precise years of experience estimates for each skill with confidence scores and visual indicators.
              </p>
            </CardContent>
          </Card>
          <Card className="hover-scale">
            <CardHeader>
              <Zap className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Lightning Fast</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Process resumes in seconds, not minutes. Get instant insights and candidate comparisons.
              </p>
            </CardContent>
          </Card>
          <Card className="hover-scale">
            <CardHeader>
              <Shield className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Secure & Private</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Your candidate data is processed securely with enterprise-grade privacy protection.
              </p>
            </CardContent>
          </Card>
          <Card className="hover-scale">
            <CardHeader>
              <Search className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Smart Filtering</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Filter candidates by skills, experience levels, job titles, and more with intelligent search.
              </p>
            </CardContent>
          </Card>
          <Card className="hover-scale">
            <CardHeader>
              <TrendingUp className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Analytics & Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Get detailed analytics on skill trends, candidate pools, and recruitment insights.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How to Use */}
      <section className="border-y bg-muted/30 py-24">
        <div className="container">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-5xl font-bold">How to Use ATS CV?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get started in three simple steps
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="text-center hover-scale">
              <CardHeader>
                <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-3xl font-bold text-primary">1</span>
                </div>
                <CardTitle>Upload Resume</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Drag and drop PDF or DOCX files. Our AI will automatically process and extract candidate information.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center hover-scale">
              <CardHeader>
                <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-3xl font-bold text-primary">2</span>
                </div>
                <CardTitle>AI Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Watch as our AI extracts skills, estimates experience, and provides confidence scores for each skill.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center hover-scale">
              <CardHeader>
                <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-3xl font-bold text-primary">3</span>
                </div>
                <CardTitle>Review & Compare</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Review detailed candidate profiles, compare skills, and make informed hiring decisions.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container py-24">
        <div className="mx-auto max-w-3xl">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-5xl font-bold">Frequently Asked Questions</h2>
          </div>
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-1" className="border rounded-lg px-6">
              <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline">
                Is ATS CV really free?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Yes! ATS CV is completely free with no hidden costs. Upload unlimited resumes and analyze candidates without any restrictions.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" className="border rounded-lg px-6">
              <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline">
                What file formats are supported?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                We support PDF and DOCX files. Our AI can extract text and analyze content from both formats with high accuracy.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3" className="border rounded-lg px-6">
              <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline">
                How accurate is the AI extraction?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Our AI provides confidence scores for each extracted skill. Most extractions have 80-95% confidence, with clear indicators for review.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4" className="border rounded-lg px-6">
              <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline">
                Can I export candidate data?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Yes! You can export candidate data as JSON or CSV files for integration with your existing ATS or HR systems.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5" className="border rounded-lg px-6">
              <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline">
                Is my data secure?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Absolutely! All data is processed securely with enterprise-grade encryption. We don't store your candidate data permanently.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-y bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center space-y-8">
            <h2 className="text-3xl md:text-5xl font-bold">
              Ready to Analyze Your First Resume?
            </h2>
            <p className="text-xl text-muted-foreground">
              Join recruiters who are making smarter hiring decisions with AI
            </p>
            <Link href="/upload">
              <Button size="lg" className="text-lg px-12 py-6">
                <Upload className="mr-2 h-5 w-5" />
                Start Analyzing - It's Free
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
