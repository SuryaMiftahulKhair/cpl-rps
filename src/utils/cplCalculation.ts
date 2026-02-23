export function calculateAvgKomponen(nilaiList: number[]): number {
  if (nilaiList.length === 0) return 0;
  return nilaiList.reduce((a, b) => a + b, 0) / nilaiList.length;
}

export function calculateCPMKScore(
  mappings: { nilai: number; bobot: number }[]
): { score: number; totalBobot: number } {
  let totalScore = 0;
  let totalBobot = 0;

  mappings.forEach((m) => {
    totalScore += m.nilai * m.bobot;
    totalBobot += m.bobot;
  });

  if (totalBobot === 0) return { score: 0, totalBobot: 0 };

  return { 
      score: totalScore / totalBobot, 
      totalBobot: totalBobot 
  };
}

export function calculateIKScore(
  inputs: { cpmkScore: number; cpmkWeight: number }[]
): number {
  if (inputs.length === 0) return 0;

  const numerator = inputs.reduce((acc, curr) => acc + (curr.cpmkScore * curr.cpmkWeight), 0);
  const denominator = inputs.reduce((acc, curr) => acc + curr.cpmkWeight, 0);

  return denominator === 0 ? 0 : numerator / denominator;
}

export function calculateFinalCPL(
  inputs: { ikScore: number; bobotIK: number }[]
): number {
  if (inputs.length === 0) return 0;

  const numerator = inputs.reduce((acc, curr) => acc + (curr.ikScore * curr.bobotIK), 0);
  const denominator = inputs.reduce((acc, curr) => acc + curr.bobotIK, 0);

  return denominator === 0 ? 0 : numerator / denominator;
}