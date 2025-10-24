export interface JobRequirement {
  skillName: string;
  category: 'frontend' | 'backend' | 'tools' | 'soft' | 'database' | 'cloud';
  minimumYears: number;
  isRequired: boolean;
  weight: number; // 1-10, menunjukkan seberapa penting skill ini
}

export interface Job {
  id: string;
  title: string;
  description: string;
  requirements: JobRequirement[];
  location?: string;
  createdAt: Date;
  status: 'active' | 'closed';
}

// Fungsi untuk menghitung skor kecocokan kandidat dengan lowongan
export function calculateMatchScore(candidate: any, job: Job): number {
  if (!candidate.skills || !job.requirements) {
    return 0;
  }

  let totalScore = 0;
  let totalWeight = 0;
  
  // Iterasi setiap requirement lowongan
  job.requirements.forEach(requirement => {
    // Cari skill yang sesuai pada kandidat
    const matchingSkill = candidate.skills.find(
      (skill: any) => 
        skill.name.toLowerCase() === requirement.skillName.toLowerCase() ||
        skill.name.toLowerCase().includes(requirement.skillName.toLowerCase())
    );
    
    // Jika skill ditemukan, hitung skor berdasarkan pengalaman
    if (matchingSkill) {
      // Jika pengalaman kandidat memenuhi atau melebihi persyaratan
      if (matchingSkill.yearsOfExperience >= requirement.minimumYears) {
        totalScore += requirement.weight * 10; // Skor penuh
      } else {
        // Skor sebagian berdasarkan persentase pengalaman
        const percentageOfRequired = matchingSkill.yearsOfExperience / requirement.minimumYears;
        totalScore += requirement.weight * 10 * percentageOfRequired;
      }
    } else if (requirement.isRequired) {
      // Jika skill wajib tidak ditemukan, berikan penalti
      totalScore -= requirement.weight * 5;
    }
    
    totalWeight += requirement.weight * 10;
  });
  
  // Normalisasi skor (0-100)
  return totalWeight > 0 ? Math.max(0, Math.min(100, (totalScore / totalWeight) * 100)) : 0;
}

// Fungsi untuk mendapatkan kandidat yang cocok dengan lowongan, diurutkan berdasarkan skor
export function getMatchingCandidates(candidates: any[], job: Job) {
  return candidates
    .map(candidate => ({
      ...candidate,
      matchScore: calculateMatchScore(candidate, job)
    }))
    .sort((a, b) => b.matchScore - a.matchScore);
}