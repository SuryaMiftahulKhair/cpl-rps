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

export function calculateCoefficient(
  sks: number, 
  ikCount: number, 
  totalIK: number, 
  cpmkWeight: number 
): number {
  const sksFactor = sks / 144;
  const weightFactor = cpmkWeight / 100; 
  const ikFactor = totalIK > 0 ? ikCount / totalIK : 0;

  return sksFactor * weightFactor * ikFactor;
}