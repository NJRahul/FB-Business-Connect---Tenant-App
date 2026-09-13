import type { TenantContext, RequirementRule, RequirementResult } from '../../../lib/insurance/types';

export function computeRequirements(
  tenant: TenantContext,
  rules: RequirementRule[],
): Map<string, RequirementResult> {
  const result = new Map<string, RequirementResult>();

  for (const rule of rules) {
    if (rule.industry_packs !== null && !rule.industry_packs.includes(tenant.industry_pack)) continue;
    if (rule.operations_types !== null && !rule.operations_types.includes(tenant.operations_type)) continue;
    if (rule.states !== null && !rule.states.includes(tenant.state)) continue;
    if (rule.min_team_size !== null && tenant.team_size < rule.min_team_size) continue;
    if (rule.min_vehicle_count !== null && tenant.vehicle_count < rule.min_vehicle_count) continue;
    if (rule.has_premises !== null && tenant.has_premises !== rule.has_premises) continue;

    const existing = result.get(rule.coverage_type_id);
    const rank = (level: string) => level === 'required' ? 2 : level === 'commonly_carried' ? 1 : 0;

    if (!existing || rank(rule.requirement_level) > rank(existing.level)) {
      result.set(rule.coverage_type_id, {
        level: rule.requirement_level,
        reason: rule.reason_text,
      });
    }
  }

  return result;
}
