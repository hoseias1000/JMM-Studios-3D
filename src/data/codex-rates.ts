/** Published Standard credit rates, checked 2026-11-11. Never treated as an invoice.
 * Input excludes cache here. Reasoning is already included in output tokens.
 */
export const codexRates: Record<string, { input: number; cached: number; output: number }> = {
  'gpt-6-astra': { input: 250, cached: 25, output: 1250 },
  'gpt-6.1-sol': { input: 50, cached: 2.5, output: 250 },
  'gpt-6.1-terra': { input: 25, cached: 1.25, output: 125 },
  'gpt-6-sol': { input: 50, cached: 5, output: 250 },
  'gpt-6-luna': { input: 2.5, cached: .25, output: 12.5 },
  'gpt-5.6-sol': { input: 100, cached: 10, output: 500 },
  'gpt-5.6-terra': { input: 50, cached: 5, output: 300 },
  'gpt-5.6-luna': { input: 5, cached: .5, output: 30 },
};
export const codexPricingSource = 'https://learn.chatgpt.com/docs/pricing';
export const codexUsageDashboard = 'https://chatgpt.com/codex/settings/usage';
