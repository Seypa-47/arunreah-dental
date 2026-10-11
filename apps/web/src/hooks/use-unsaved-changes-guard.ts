import { useEffect } from 'react';
import { useBlocker } from 'react-router-dom';

const defaultMessage = 'You have unsaved changes. Leave this page without saving?';

/**
 * Warns before leaving a form with unsaved edits: blocks in-app navigation with a
 * confirm prompt, and warns on tab close/refresh. Requires a data router
 * (createBrowserRouter), which this app already uses.
 */
export function useUnsavedChangesGuard(isDirty: boolean, message: string = defaultMessage) {
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) => isDirty && currentLocation.pathname !== nextLocation.pathname,
  );

  useEffect(() => {
    if (blocker.state !== 'blocked') return;
    if (window.confirm(message)) {
      blocker.proceed();
    } else {
      blocker.reset();
    }
  }, [blocker, message]);

  useEffect(() => {
    if (!isDirty) return undefined;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);
}
