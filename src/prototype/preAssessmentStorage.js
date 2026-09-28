const keyFor = userId => `scalaris:pre-assessment:v1:${userId || 'preview'}`;

function summaryOf(result) {
    if (!result || !Number.isInteger(result.score) || result.score < 0 || result.score > 20
        || result.pct !== Math.round(result.score / 20 * 100)) return null;
    const band = result.pct >= 80 ? 'Advanced' : result.pct >= 60 ? 'Intermediate' : 'Beginner';
    return { score: result.score, pct: result.pct, band };
}

export function loadPreAssessment(userId) {
    try {
        return summaryOf(JSON.parse(window.localStorage.getItem(keyFor(userId))));
    } catch {
        return null;
    }
}

export function savePreAssessment(userId, result) {
    try {
        const summary = summaryOf(result);
        if (!summary) return false;
        // Keep only the score summary, never participant details or survey answers.
        window.localStorage.setItem(keyFor(userId), JSON.stringify(summary));
        return true;
    } catch {
        return false;
    }
}
