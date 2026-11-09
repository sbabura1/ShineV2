// The authoring bank is kept outside generated release content. Support is
// attached only to Vitalis mission definitions, never to baseline questions.
export function addVitalisSupport(definition, bank) {
  if (definition.sectorId !== 'vitalis' || !definition.missionId || definition.sections || definition.assessmentId) {
    throw new Error('Vitalis support can only be added to Vitalis mission content.');
  }
  for (const question of definition.questions) {
    const authored = bank.questions[question.id];
    if (!authored) throw new Error(`Missing Vitalis support for ${question.id}`);
    const { responses, ...support } = authored;
    question.support = structuredClone(support);
    for (const response of question.responses || []) {
      const guidance = responses?.[response.sourceNumber];
      if (!guidance) throw new Error(`Missing Vitalis support for ${response.id}`);
      response.support = structuredClone(guidance);
    }
  }
  return definition;
}
