import { Obligation, UserProfile, FSIBreakdown } from '../types';

export const fsiCalculator = {
  calculateFSI(obligations: Obligation[], profile: UserProfile): FSIBreakdown {
    const totalObligations = obligations.reduce((sum, obl) => sum + obl.monthlyAmount, 0);
    const emiTotal = obligations
      .filter(obl => obl.category === 'EMI')
      .reduce((sum, obl) => sum + obl.monthlyAmount, 0);

    // 1. Obligation Pressure (35% weight)
    const obligationScore = this.calculateObligationScore(totalObligations, profile.monthlyIncome);

    // 2. Liquidity Coverage (30% weight)
    const liquidityScore = this.calculateLiquidityScore(profile.emergencySavings, totalObligations);

    // 3. EMI Concentration (20% weight)
    const emiScore = this.calculateEMIScore(emiTotal, totalObligations);

    // 4. Income Stability (15% weight)
    const incomeScore = this.calculateIncomeScore(profile.incomeType);

    // Calculate weighted FSI
    const totalFSI = Math.round(
      obligationScore * 0.35 +
      liquidityScore * 0.30 +
      emiScore * 0.20 +
      incomeScore * 0.15
    );

    // Clamp between 0-100
    const clampedFSI = Math.max(0, Math.min(100, totalFSI));

    return {
      obligationScore: Math.round(obligationScore),
      liquidityScore: Math.round(liquidityScore),
      emiScore: Math.round(emiScore),
      incomeScore: Math.round(incomeScore),
      totalFSI: clampedFSI,
    };
  },

  calculateObligationScore(totalObligations: number, monthlyIncome: number): number {
    if (monthlyIncome === 0) return 0;
    const ratio = totalObligations / monthlyIncome;
    const score = 100 * (1 - Math.pow(ratio, 1.3));
    return Math.max(0, Math.min(100, score));
  },

  calculateLiquidityScore(emergencySavings: number, totalObligations: number): number {
    if (totalObligations === 0) return 100;
    const coverage = emergencySavings / totalObligations;
    
    if (coverage >= 12) return 100;
    if (coverage >= 6) return 80;
    if (coverage >= 3) return 60;
    if (coverage >= 1) return 40;
    return 20;
  },

  calculateEMIScore(emiTotal: number, totalObligations: number): number {
    if (totalObligations === 0) return 100;
    const emiRatio = emiTotal / totalObligations;
    const score = 100 - (emiRatio * 60);
    return Math.max(0, score);
  },

  calculateIncomeScore(incomeType: string): number {
    switch (incomeType) {
      case 'Salaried':
        return 90;
      case 'Business':
        return 70;
      case 'Freelance':
        return 50;
      default:
        return 50;
    }
  },

  getRiskCategory(fsi: number): { label: string; color: string; range: string } {
    if (fsi >= 80) {
      return { label: 'Structurally Strong', color: '#10b981', range: '80-100' };
    } else if (fsi >= 65) {
      return { label: 'Stable', color: '#34d399', range: '65-79' };
    } else if (fsi >= 50) {
      return { label: 'Sensitive', color: '#fbbf24', range: '50-64' };
    } else if (fsi >= 35) {
      return { label: 'High Exposure', color: '#f97316', range: '35-49' };
    } else {
      return { label: 'Fragile', color: '#ef4444', range: '0-34' };
    }
  },
};
