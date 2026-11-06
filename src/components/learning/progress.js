const hasAnswer = value => Array.isArray(value) ? value.length > 0
  : typeof value === 'string' ? value.trim().length > 0
    : typeof value === 'number' ? Number.isFinite(value) : value != null;

// Count responses, rather than the page a student has reached. Investigation
// evidence remains separate from its written responses and submission validation.
export function questionProgress(definition, answers = {}) {
  const activities = definition.sections?.flatMap(section => section.questions) || definition.questions || [];
  const questions = activities.flatMap(question => question.type === 'investigation' ? question.responses : [question]);
  const answered = questions.filter(question => {
    const value = answers[question.id];
    if (!hasAnswer(value)) return false;
    const followUp = question.followUp;
    return !followUp || !Array.isArray(value) || !value.includes(followUp.whenOptionId)
      || hasAnswer(answers[`${question.id}:${followUp.field.id}`]);
  }).length;
  return { answered, total: questions.length, remaining: questions.length - answered };
}
