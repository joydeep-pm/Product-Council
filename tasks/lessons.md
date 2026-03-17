# Lessons

## 2026-03-17
- If sub-agents are used in parallel on a shared workspace, enforce strict disjoint write ownership (for example `backend/**` vs `frontend/**`) and avoid local edits while they run.
- When unexpected file mutations appear, stop immediately, confirm direction, and then continue with a single-writer or isolated-ownership execution mode.
- When design quality is called out as unacceptable, switch from incremental tweaks to a deliberate visual-system pass (hierarchy, spacing rhythm, interaction states, and error UX) before further deployment.
