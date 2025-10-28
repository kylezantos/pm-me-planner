import {
  endWorkSession,
  getCurrentActiveSession,
  startWorkSession,
  updateTask,
  // getTaskById,
} from '../repositories';

type SessionNotes = string | null | undefined;

export interface StartWorkingOptions {
  blockInstanceId?: string | null;
  notes?: SessionNotes;
  endPreviousNotes?: SessionNotes;
  setTaskStatusInProgress?: boolean;
}

export interface SwitchTaskOptions {
  notesForPrevious?: SessionNotes;
  notesForNew?: SessionNotes;
  blockInstanceId?: string | null;
  setTaskStatusInProgress?: boolean;
}

export interface StopWorkingOptions {
  notes?: SessionNotes;
}

function nowIso(): string {
  return new Date().toISOString();
}

async function endExistingActiveSession(
  userId: string,
  notes?: SessionNotes
): Promise<void> {
  const existing = await getCurrentActiveSession(userId);
  if (existing.error) throw existing.error;
  const session = existing.data;
  if (!session) return;

  // End the session first to compute duration
  const endRes = await endWorkSession(session.id, { notes: notes ?? null });
  if (endRes.error) throw endRes.error;

  // Flip task flag to inactive and set actual_end
  const taskId = session.task_id;
  const taskUpdate = await updateTask(taskId, {
    is_currently_active: false,
    actual_end: nowIso(),
  });
  if (taskUpdate.error) throw taskUpdate.error;
}

export async function startWorking(
  userId: string,
  taskId: string,
  options: StartWorkingOptions = {}
): Promise<{ sessionId: string; endedPrevious: boolean } | { error: Error } > {
  try {
    let endedPrevious = false;
    const existing = await getCurrentActiveSession(userId);
    if (existing.error) throw existing.error;
    const active = existing.data;

    if (active && active.task_id !== taskId) {
      await endExistingActiveSession(userId, options.endPreviousNotes);
      endedPrevious = true;
    }

    if (active && active.task_id === taskId) {
      // Already active on this task — no-op
      return { sessionId: active.id, endedPrevious };
    }

    // Set task flags
    const taskUpdate = await updateTask(taskId, {
      is_currently_active: true,
      actual_start: nowIso(),
      ...(options.setTaskStatusInProgress ? { status: 'in_progress' } : {}),
    });
    if (taskUpdate.error) throw taskUpdate.error;

    const session = await startWorkSession(taskId, userId, {
      blockInstanceId: options.blockInstanceId ?? null,
      notes: options.notes ?? null,
    });
    if (session.error || !session.data) throw session.error ?? new Error('Failed to create session');

    return { sessionId: session.data.id, endedPrevious };
  } catch (error) {
    return { error: error as Error };
  }
}

export async function stopWorking(
  userId: string,
  options: StopWorkingOptions = {}
): Promise<{ ended: boolean } | { error: Error }> {
  try {
    const existing = await getCurrentActiveSession(userId);
    if (existing.error) throw existing.error;
    if (!existing.data) return { ended: false };

    const session = existing.data;

    // End session and update task flags
    const endRes = await endWorkSession(session.id, { notes: options.notes ?? null });
    if (endRes.error) throw endRes.error;

    const taskUpdate = await updateTask(session.task_id, {
      is_currently_active: false,
      actual_end: nowIso(),
    });
    if (taskUpdate.error) throw taskUpdate.error;

    return { ended: true };
  } catch (error) {
    return { error: error as Error };
  }
}

export async function switchTask(
  userId: string,
  fromTaskId: string,
  toTaskId: string,
  options: SwitchTaskOptions = {}
): Promise<{ sessionId: string; switched: boolean } | { error: Error }> {
  try {
    // end current (if any) with optional notes
    const existing = await getCurrentActiveSession(userId);
    if (existing.error) throw existing.error;

    if (existing.data && existing.data.task_id !== fromTaskId) {
      // If the active task doesn't match expected, still end it but note mismatch
      await endExistingActiveSession(userId, options.notesForPrevious ?? '[auto] switchTask');
    } else if (existing.data) {
      await endExistingActiveSession(userId, options.notesForPrevious);
    }

    // start new
    const started = await startWorking(userId, toTaskId, {
      notes: options.notesForNew,
      blockInstanceId: options.blockInstanceId ?? null,
      setTaskStatusInProgress: options.setTaskStatusInProgress ?? true,
    });
    if ('error' in started) return started;

    return { sessionId: started.sessionId, switched: true };
  } catch (error) {
    return { error: error as Error };
  }
}
