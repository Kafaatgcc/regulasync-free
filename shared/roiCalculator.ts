/** Illustrative scenario inputs, not measured customer outcomes or savings guarantees. */
export const ROI_PLANS = {
  core: { label: "Core", monthlyPricePerSeat: 90 },
  professional: { label: "Professional", monthlyPricePerSeat: 175 },
  enterprise: { label: "Enterprise", monthlyPricePerSeat: 350 },
} as const;

export type RoiPlan = keyof typeof ROI_PLANS;

export interface RoiInputs {
  plan: RoiPlan;
  seats: number;
  hourlyCost: number;
  teamHoursPerMonth: number;
  timeSavingPercent: number;
  cashRealizationPercent: number;
  implementationCost: number;
}

export const DEFAULT_ROI_INPUTS: Readonly<RoiInputs> = {
  plan: "core",
  seats: 5,
  hourlyCost: 40,
  teamHoursPerMonth: 120,
  timeSavingPercent: 25,
  cashRealizationPercent: 50,
  implementationCost: 5000,
};

export function getRoiInputErrors(inputs: RoiInputs): string[] {
  const errors: string[] = [];
  if (!Object.prototype.hasOwnProperty.call(ROI_PLANS, inputs.plan)) {
    errors.push("Select a valid subscription plan.");
  }
  if (!Number.isSafeInteger(inputs.seats) || inputs.seats < 1) {
    errors.push("Licensed seats must be a whole number of at least 1.");
  }
  for (const [label, value] of [
    ["Hourly staff cost", inputs.hourlyCost],
    ["Total team hours per month", inputs.teamHoursPerMonth],
    ["One-time implementation and training cost", inputs.implementationCost],
  ] as const) {
    if (!Number.isFinite(value) || value < 0) {
      errors.push(`${label} must be a finite, non-negative number.`);
    }
  }
  for (const [label, value] of [
    ["Time saving", inputs.timeSavingPercent],
    ["Cash realization", inputs.cashRealizationPercent],
  ] as const) {
    if (!Number.isFinite(value) || value < 0 || value > 100) {
      errors.push(`${label} must be between 0 and 100%.`);
    }
  }
  return errors;
}

export function calculateRoi(inputs: RoiInputs) {
  const errors = getRoiInputErrors(inputs);
  if (errors.length) throw new RangeError(errors.join(" "));

  const monthlyLicenseCost = inputs.seats * ROI_PLANS[inputs.plan].monthlyPricePerSeat;
  const annualLicenseCost = monthlyLicenseCost * 12;
  const yearOneTotalCost = annualLicenseCost + inputs.implementationCost;
  // One aggregate team-hours pool includes audit work once; it is not multiplied by seats.
  const baselineAnnualHours = inputs.teamHoursPerMonth * 12;
  const annualHoursSaved = baselineAnnualHours * (inputs.timeSavingPercent / 100);
  const remainingAnnualHours = baselineAnnualHours - annualHoursSaved;
  const annualTimeValue = annualHoursSaved * inputs.hourlyCost;
  // Only hours whose costs can actually be removed contribute to financial ROI.
  const annualCashSavings = annualTimeValue * (inputs.cashRealizationPercent / 100);
  const annualOpportunityValue = annualTimeValue - annualCashSavings;
  const annualOpportunityHours = annualHoursSaved * (1 - inputs.cashRealizationPercent / 100);
  const yearOneNetSavings = annualCashSavings - yearOneTotalCost;
  const financialRoiPercent = (yearOneNetSavings / yearOneTotalCost) * 100;
  const netMonthlySavings = annualCashSavings / 12 - monthlyLicenseCost;
  const paybackStatus = netMonthlySavings <= 0
    ? "no-payback"
    : inputs.implementationCost === 0
      ? "no-setup-cost"
      : "recoverable";
  const paybackMonths = paybackStatus === "recoverable"
    ? inputs.implementationCost / netMonthlySavings
    : null;

  const result = {
    monthlyLicenseCost,
    annualLicenseCost,
    yearOneTotalCost,
    baselineAnnualHours,
    annualHoursSaved,
    remainingAnnualHours,
    annualTimeValue,
    annualCashSavings,
    annualOpportunityValue,
    annualOpportunityHours,
    yearOneNetSavings,
    financialRoiPercent,
    netMonthlySavings,
    paybackStatus,
    paybackMonths,
  };
  // Reject arithmetic overflow instead of capping or displaying misleading results.
  if (Object.values(result).some(value => typeof value === "number" && !Number.isFinite(value))) {
    throw new RangeError("These inputs exceed the calculation range. Enter smaller values.");
  }
  return result;
}
