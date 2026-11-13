import { useCallback, useEffect, useRef, useState } from 'react';
import { api, ApiError, requestKey, segment } from './client';
import { isSectorAccessError } from './sectorAccess';

// One server run per mounted mission/difficulty. No answers or results in localStorage.
export default function useRun({ startPath, existingRunId, restart, previousRunId, kind, onProgress, accessBlocked = false, accessVersion = 0, onRefreshAccess }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [saveState, setSaveState] = useState('saved');
  const [submitting, setSubmitting] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState(kind === 'ASSESSMENT' ? 'assessment' : existingRunId ? 'resume' : 'mission');
  const [retryLoad, setRetryLoad] = useState(0);
  const [accessDenied, setAccessDenied] = useState(false);
  const restricted = useRef(accessBlocked);
  restricted.current = accessBlocked || accessDenied;
  const onRefreshAccessRef = useRef(onRefreshAccess);
  onRefreshAccessRef.current = onRefreshAccess;
  const snapshot = useRef(null);
  const pending = useRef({ answers: {}, investigations: {} });
  const inFlight = useRef(null);
  const timer = useRef(null);
  const mounted = useRef(false);
  const openKey = useRef(requestKey());
  const submitOperation = useRef(null);
  const blocked = useRef(false);
  const onProgressRef = useRef(onProgress);
  onProgressRef.current = onProgress;
  const commitView = useCallback(next => {
    snapshot.current = next;
    if (mounted.current) setData(next);
  }, []);
  const reportFailure = useCallback(failure => {
    if (!mounted.current) return;
    setError(failure);
    if (isSectorAccessError(failure)) {
      restricted.current = true;
      setAccessDenied(true);
      clearTimeout(timer.current);
      onRefreshAccessRef.current?.().catch(() => {});
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    let cancelled = false;
    async function load() {
      setError(null);
      try {
        if (restricted.current) throw new ApiError('This sector is not currently available in your class.', 403, 'SECTOR_NOT_ALLOWED');
        const opened = existingRunId ? { run: { runId: existingRunId } } : await api(startPath, {
          method: 'POST', body: restart ? { restart: true, previousRunId } : {}, key: openKey.current,
        });
        if (!cancelled) setLoadingPhase(kind === 'ASSESSMENT' ? 'assessment' : opened.resumed || existingRunId ? 'resume' : 'mission');
        const id = segment(opened.run.runId);
        const [saved, definition] = await Promise.all([api(`/v1/runs/${id}`), api(`/v1/runs/${id}/content`)]);
        if (!cancelled) { blocked.current = false; commitView({ ...saved, definition }); }
      } catch (failure) { if (!cancelled) reportFailure(failure); }
    }
    load();
    return () => { cancelled = true; mounted.current = false; clearTimeout(timer.current); };
  }, [startPath, existingRunId, restart, previousRunId, kind, retryLoad, commitView, reportFailure]);

  const flush = useCallback(async () => {
    clearTimeout(timer.current);
    if (restricted.current) throw new ApiError('This sector is not currently available in your class.', 403, 'SECTOR_NOT_ALLOWED');
    if (blocked.current) throw new Error('Reload the latest saved work before continuing.');
    if (!snapshot.current || !['IN_PROGRESS', 'CHANGES_REQUESTED'].includes(snapshot.current.run.status)) return;
    if (!inFlight.current) {
      const queued = pending.current;
      if (!Object.keys(queued.answers).length && !Object.keys(queued.investigations).length && !('currentQuestionId' in queued) && !('currentStep' in queued)) return;
      pending.current = { answers: {}, investigations: {} };
      inFlight.current = { key: requestKey(), body: { expectedVersion: snapshot.current.run.rev, ...queued } };
    }
    // Failed requests retain their exact body/key; retries cannot create duplicate writes.
    const operation = inFlight.current;
    if (operation.promise) { await operation.promise; return flush(); }
    setSaveState('saving');
    operation.promise = (async () => {
      try {
        const saved = await api(`/v1/runs/${segment(snapshot.current.run.runId)}`, { method: 'PATCH', body: operation.body, key: operation.key });
        inFlight.current = null;
        commitView({ ...snapshot.current, run: saved.run });
        if (mounted.current) { setError(null); setSaveState('saved'); }
      } catch (failure) {
        operation.promise = null;
        if (failure.status === 409) { blocked.current = true; setSaveState('conflict'); }
        else setSaveState('error');
        reportFailure(failure);
        throw failure;
      }
    })();
    await operation.promise;
    if (Object.keys(pending.current.answers).length || Object.keys(pending.current.investigations).length || 'currentQuestionId' in pending.current || 'currentStep' in pending.current) await flush();
  }, [commitView, reportFailure]);

  useEffect(() => {
    if (accessBlocked) { clearTimeout(timer.current); return; }
    if (!accessVersion) return;
    restricted.current = false;
    setAccessDenied(false);
    if (snapshot.current) {
      setError(current => isSectorAccessError(current) ? null : current);
      if (inFlight.current || Object.keys(pending.current.answers).length || Object.keys(pending.current.investigations).length || 'currentQuestionId' in pending.current || 'currentStep' in pending.current) {
        timer.current = setTimeout(() => flush().catch(() => {}), 650);
      }
    }
  }, [accessBlocked, accessVersion, flush]);

  const queue = useCallback((patch) => {
    if (!snapshot.current || blocked.current || restricted.current || !['IN_PROGRESS', 'CHANGES_REQUESTED'].includes(snapshot.current.run.status)) return;
    pending.current = { ...pending.current, ...patch,
      answers: { ...pending.current.answers, ...patch.answers }, investigations: { ...pending.current.investigations, ...patch.investigations } };
    commitView({ ...snapshot.current, answers: { ...snapshot.current.answers, ...patch.answers },
      investigations: { ...snapshot.current.investigations, ...patch.investigations },
      run: { ...snapshot.current.run, ...('currentQuestionId' in patch ? { currentQuestionId: patch.currentQuestionId } : {}),
        ...('currentStep' in patch ? { currentStep: patch.currentStep } : {}) } });
    setSaveState('unsaved');
    clearTimeout(timer.current);
    timer.current = setTimeout(() => { flush().catch(() => {}); }, 650);
  }, [commitView, flush]);

  useEffect(() => {
    const beforeUnload = event => {
      if (inFlight.current || Object.keys(pending.current.answers).length || Object.keys(pending.current.investigations).length) {
        event.preventDefault(); event.returnValue = '';
      }
    };
    const visibility = () => { if (document.visibilityState === 'hidden') flush().catch(() => {}); };
    window.addEventListener('beforeunload', beforeUnload);
    document.addEventListener('visibilitychange', visibility);
    return () => { window.removeEventListener('beforeunload', beforeUnload); document.removeEventListener('visibilitychange', visibility); };
  }, [flush]);

  // Routed navigation refreshes progress after flushing, and owns its loading UI.
  const prepareLeave = useCallback(async () => {
    if (!restricted.current) return flush();
    const unsaved = inFlight.current || Object.keys(pending.current.answers).length || Object.keys(pending.current.investigations).length || 'currentQuestionId' in pending.current || 'currentStep' in pending.current;
    if (unsaved && !window.confirm('Your teacher has restricted this sector. Leave and discard edits that could not be saved? Previously saved progress will be kept.')) {
      throw new ApiError('Navigation cancelled.', 0, 'NAVIGATION_CANCELLED');
    }
    clearTimeout(timer.current);
    pending.current = { answers: {}, investigations: {} }; inFlight.current = null;
  }, [flush]);
  const leave = async callback => { try { await prepareLeave(); callback(); } catch { /* Keep unsaved work on screen. */ } };
  const submit = async () => {
    setSubmitting(true);
    try {
      await flush();
      if (!submitOperation.current) submitOperation.current = { key: requestKey(), body: { expectedVersion: snapshot.current.run.rev } };
      const operation = submitOperation.current;
      const result = await api(`/v1/${kind === 'ASSESSMENT' ? 'assessment' : 'mission'}-runs/${segment(snapshot.current.run.runId)}/submit`, {
        method: 'POST', body: operation.body, key: operation.key,
      });
      commitView({ ...snapshot.current, run: result.run });
      setError(null);
      await onProgressRef.current?.();
    } catch (failure) {
      if (failure.status && failure.status < 500) submitOperation.current = null;
      reportFailure(failure);
    } finally { setSubmitting(false); }
  };
  const reload = () => {
    if ((saveState === 'conflict' || saveState === 'unsaved' || saveState === 'error') && !window.confirm('Reload the latest saved work? Unsaved edits on this screen will be discarded.')) return;
    pending.current = { answers: {}, investigations: {} }; inFlight.current = null; blocked.current = false;
    restricted.current = false; setAccessDenied(false);
    setSaveState('saved'); setRetryLoad(value => value + 1);
  };
  return { data, error, saveState, submitting, loadingPhase, queue, flush, prepareLeave, leave, submit, reload, restricted: accessBlocked || accessDenied };
}
