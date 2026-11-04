import test from 'node:test';
import assert from 'node:assert/strict';
import {initialAssessment, assessPriority} from '../src/priority.js';
const decision = {priority:'routine', reason:'Inspected and assessed', actorId:'manager-1', role:'manager', at:'2026-11-04T12:00:00Z'};
test('new reports await assessment; a routine decision never removes a danger flag', () => {
 const original=initialAssessment({possibleDanger:true}); const updated=assessPriority(original,decision);
 assert.equal(original.priority,'awaiting_assessment'); assert.equal(original.history.length,0);
 assert.equal(updated.priority,'routine'); assert.equal(updated.possibleDanger,true);
 assert.deepEqual(updated.history[0],{from:'awaiting_assessment',to:'routine',reason:decision.reason,actorId:decision.actorId,at:decision.at});
 const later=assessPriority(updated,{...decision,priority:'emergency',reason:'New evidence',actorId:'owner-2',role:'owner'});
 assert.equal(later.history.length,2); assert.equal(updated.history.length,1); assert.equal(later.possibleDanger,true);
});
test('unauthorised, unrecorded or invalid assessments fail', () => {
 const state=initialAssessment();
 for (const change of [{role:'resident'},{role:'contractor'},{actorId:''},{reason:'  '},{priority:'red'},{at:'not a date'},{priority:'awaiting_assessment'}]) assert.throws(()=>assessPriority(state,{...decision,...change}));
 assert.throws(()=>initialAssessment({possibleDanger:'false'}));
});
