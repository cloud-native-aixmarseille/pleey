# Phase 02 restore cutover

Run this procedure after PostgreSQL restore and before any public API, Socket.IO or transfer polling
traffic resumes.

1. Keep ingress closed.
2. Verify `DATABASE_URL` points to the restored database and the candidate image has applied all
   checked-in migrations.
3. Run `pnpm --filter @pleey/api maintenance:invalidate-restored-auth`.
4. Confirm the command reports successful invalidation of native Sessions, Verification records and
   nonterminal transfers.
5. Restart API workers and wait for the startup anonymous-retirement sweep.
6. Confirm metrics report no restored session, no nonterminal restored transfer and a completed
   retirement sweep.
7. Open public traffic. Registered users must sign in again. Expired anonymous credentials are not
   reconstructed from nicknames or retained participants.

This is a disaster-restore operation only. Normal process restarts and compatible deployments do not
run it. Backups are a separate retention boundary and may still contain data deleted from the live
database.
