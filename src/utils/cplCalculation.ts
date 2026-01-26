//file: src/app/utils/cplCalculation.ts

export function calculateAvgKomponen(nilaiList: number[]): number {
  if (nilaiList.length === 0) return 0;
  return nilaiList.reduce((a, b) => a + b, 0) / nilaiList.length;
}

export function calculateCPMKScore(mappings: { avg: number; bobot: number }[]): number {
  let score = 0;
  mappings.forEach((m) => {
    score += m.avg * (m.bobot / 100);
  });
  return score;
}

// Rumus Koefisien sesuai MLOA
export function calculateCoefficient(sks: number, ikCount: number, totalIK: number): number {
  // Asumsi bobot CPMK 100% jika tidak didefinisikan lain
  return (sks / 144) * 1 * (totalIK > 0 ? ikCount / totalIK : 0);
}

