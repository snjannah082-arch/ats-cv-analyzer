# ATS CV - Smart Resume Analyzer

A modern, elegant Applicant Tracking System (ATS) web app built with Next.js, TypeScript, and TailwindCSS. Features AI-powered resume analysis, skill extraction, and candidate management with a beautiful UI inspired by modern design systems.

## 🚀 Features

- **AI-Powered Resume Analysis**: Automatically extract candidate information, skills, and experience levels
- **Drag & Drop Upload**: Support for PDF and DOCX files with intuitive file handling
- **Skill Categorization**: Organize skills by Frontend, Backend, Tools, Soft Skills, Database, and Cloud
- **Experience Mapping**: Estimate years of experience for each skill with confidence scores
- **Candidate Dashboard**: View, filter, and search through all uploaded candidates
- **Detailed Profiles**: Comprehensive candidate profiles with skill breakdowns and analytics
- **Dark/Light Theme**: Beautiful theme switching with consistent design
- **Responsive Design**: Optimized for desktop and mobile devices

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS + Shadcn/UI
- **Icons**: Lucide React
- **Theme**: next-themes
- **File Processing**: Mock AI parsing (easily replaceable with real AI services)

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ats-cv
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎨 Design System

The app follows a modern design system with:

- **Color Palette**: Primary blue with gradient accents
- **Typography**: Clean, readable fonts with proper hierarchy
- **Components**: Consistent Shadcn/UI components
- **Animations**: Subtle hover effects and smooth transitions
- **Layout**: Card-based layouts with proper spacing
- **Theme**: Dark/light mode support

## 📱 Pages & Features

### Home Page (`/`)
- Hero section with gradient title
- Feature highlights
- FAQ section
- Call-to-action buttons

### Upload Page (`/upload`)
- Drag & drop file upload
- File validation (PDF, DOCX, max 10MB)
- AI processing simulation
- Progress indicators
- Results preview

### Candidates Dashboard (`/candidates`)
- Grid view of all candidates
- Search and filter functionality
- Statistics overview
- Skill category breakdowns
- Quick actions

### Candidate Detail (`/candidates/[id]`)
- Comprehensive candidate profile
- Tabbed interface (Overview, Skills, Experience, Resume)
- Skill categorization with accordions
- Experience analysis
- Confidence scores

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file for configuration:

```env
# Add your API keys here
OPENAI_API_KEY=your_openai_key_here
# Add other service configurations
```

### AI Integration
The current implementation uses mock data. To integrate with real AI services:

1. Replace the `parseResume` function in `lib/ai-parser.ts`
2. Add your preferred AI service (OpenAI, Anthropic, etc.)
3. Implement real file parsing (PDF.js, mammoth.js)
4. Add proper error handling and validation

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform

## 📊 Data Storage

Currently uses localStorage for demo purposes. For production:

1. **Database Integration**: Add your preferred database (PostgreSQL, MongoDB, etc.)
2. **File Storage**: Integrate with cloud storage (AWS S3, Cloudinary, etc.)
3. **Authentication**: Add user authentication and authorization
4. **API Routes**: Create proper API endpoints for data management

## 🎯 Future Enhancements

- **Real AI Integration**: Connect to OpenAI or other AI services
- **Advanced Analytics**: Skill trends, candidate comparisons
- **Export Features**: PDF reports, CSV exports
- **Team Collaboration**: Multi-user support
- **API Integration**: Connect to existing ATS systems
- **Mobile App**: React Native companion app

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Design inspiration from modern ATS systems
- UI components from Shadcn/UI
- Icons from Lucide React
- Built with Next.js and TailwindCSS

---

**Built with ❤️ for modern recruiters and HR professionals**

## 🧭 Usage

1. Install dependencies: `npm install`.
2. Start development: `npm run dev` and open `http://localhost:3000` (port may vary; check the terminal).
3. Open the `Upload` page (`/upload`).
4. Choose a sample file from `public/example-cv-ats/` or upload your own CV (PDF/DOCX).
5. Wait for parsing; the summary, skills, and experience will appear.
6. Save the candidate and view it on `Candidates` (`/candidates`).
7. On the candidate card, use the three-dot menu for actions like `View Profile`, `Mark as Active`, `Mark as Not to Moving Forward`, `Archive`, and `Delete Candidate`.
8. To create a job and see match indicators, go to `Jobs` (`/jobs` or `/jobs/new`) and then return to `Candidates`.

## 📁 Sample Files in `public`

Sample ATS CVs are available at: `public/example-cv-ats/`
- `Dimas_Hidayat_DataAnalyst_ATS.pdf`
- `Nadia_Rahma_HR_ATS.pdf`
- `Rizky_Pratama_UIUX_ATS.pdf`

## 🏗️ Build & Start (Production)

- Build: `npm run build`
- Start: `npm run start` (serves the production build from `.next/`).
