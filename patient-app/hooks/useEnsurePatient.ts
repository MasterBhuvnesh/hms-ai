import { useEffect, useRef, useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-expo';

import { ensurePatientForClerk, type PatientRow } from '@/lib/patients';
import logger from '@/utils/logger';
import { createClerkSupabaseClient } from '@/utils/supabase';

// Links the signed-in Clerk user to a patients row at sign-up and sign-in.
// Runs once per clerk user id. Safe to mount in the signed-in tabs layout.
export function useEnsurePatient() {
  const { user, isLoaded: userLoaded } = useUser();
  const { getToken } = useAuth();
  const [patient, setPatient] = useState<PatientRow | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);
  const doneFor = useRef<string | null>(null);

  const getTokenRef = useRef(getToken);
  useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);

  useEffect(() => {
    if (!userLoaded || !user) return;
    if (doneFor.current === user.id) return;
    doneFor.current = user.id;
    let cancelled = false;

    (async () => {
      try {
        setLinkError(null);
        const client = createClerkSupabaseClient(() => getTokenRef.current());
        const row = await ensurePatientForClerk(client, {
          clerkUserId: user.id,
          email: user.emailAddresses[0]?.emailAddress ?? null,
          fullName: user.fullName ?? null,
        });
        if (!cancelled) setPatient(row);
        logger.success(`Patient linked: ${row.id}`);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Patient link failed';
        if (!cancelled) setLinkError(message);
        logger.error(`Patient link failed: ${message}`);
        doneFor.current = null;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userLoaded, user]);

  return { patient, linkError };
}
