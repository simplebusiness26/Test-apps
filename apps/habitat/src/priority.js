// Isolated V2 domain logic. Not wired to the synthetic pilot or a legal rules engine.
const priorities = new Set(['awaiting_assessment', 'emergency', 'urgent', 'routine']);
const managers = new Set(['owner', 'manager']);
export function initialAssessment({possibleDanger = false} = {}) {
  if (typeof possibleDanger !== 'boolean') throw new TypeError('possibleDanger must be boolean');
  return Object.freeze({priority: 'awaiting_assessment', possibleDanger, history: Object.freeze([])});
}
export function assessPriority(state, {priority, reason, actorId, role, at}) {
  if (!managers.has(role)) throw new Error('Only authorised managers may assess priority');
  if (!state || !priorities.has(state.priority) || typeof state.possibleDanger !== 'boolean' || !Array.isArray(state.history)) throw new TypeError('Invalid assessment state');
  if (!priorities.has(priority)) throw new TypeError('Invalid priority');
  if (typeof actorId !== 'string' || !actorId.trim()) throw new TypeError('Actor required');
  if (typeof reason !== 'string' || !reason.trim() || reason.length > 2000) throw new TypeError('Reason required');
  if (typeof at !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(at) || !Number.isFinite(Date.parse(at))) throw new TypeError('UTC timestamp required');
  if (priority === state.priority) throw new Error('Priority is unchanged');
  const event = Object.freeze({from: state.priority, to: priority, reason: reason.trim(), actorId: actorId.trim(), at});
  return Object.freeze({priority, possibleDanger: state.possibleDanger, history: Object.freeze([...state.history, event])});
}
