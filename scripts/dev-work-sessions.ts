/*
  Dev script to exercise work session orchestration without UI.

  Usage examples:
    npm run build && node dist/scripts/dev-work-sessions.js start <userId> <taskId> [blockInstanceId]
    npm run build && node dist/scripts/dev-work-sessions.js switch <userId> <fromTaskId> <toTaskId> [blockInstanceId]
    npm run build && node dist/scripts/dev-work-sessions.js stop <userId>

  Notes:
  - Requires Supabase env configured (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) as used by the app.
  - Uses the same repositories / supabase client as the app code.
*/

import { startWorking, stopWorking, switchTask } from '../src/lib/workSessions/orchestrator';

function usage(): never {
  console.log('Usage:');
  console.log('  start  <userId> <taskId> [blockInstanceId]');
  console.log('  switch <userId> <fromTaskId> <toTaskId> [blockInstanceId]');
  console.log('  stop   <userId>');
  process.exit(1);
}

async function main() {
  const [, , cmd, ...rest] = process.argv;
  if (!cmd) usage();

  if (cmd === 'start') {
    const [userId, taskId, maybeBlock] = rest;
    if (!userId || !taskId) usage();
    const res = await startWorking(userId, taskId, {
      blockInstanceId: maybeBlock ?? null,
      setTaskStatusInProgress: true,
    });
    console.log(res);
    return;
  }

  if (cmd === 'switch') {
    const [userId, fromTaskId, toTaskId, maybeBlock] = rest;
    if (!userId || !fromTaskId || !toTaskId) usage();
    const res = await switchTask(userId, fromTaskId, toTaskId, {
      blockInstanceId: maybeBlock ?? null,
      setTaskStatusInProgress: true,
    });
    console.log(res);
    return;
  }

  if (cmd === 'stop') {
    const [userId] = rest;
    if (!userId) usage();
    const res = await stopWorking(userId, {});
    console.log(res);
    return;
  }

  usage();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

