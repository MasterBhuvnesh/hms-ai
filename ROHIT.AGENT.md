# ROHIT.AGENT.md - Hospital AI, Supabase, Clerk, and Patient App Handoff

## 1. Mission for Rohit
Own the next phase: supervised AI writes, Supabase migration, Clerk authentication, Supabase MCP usage, patient application, and patient-side AI.

Do not break the current staff dashboard. Keep role-based access strict. Keep audit logging complete.

## 2. Current repo snapshot
- Next.js App Router dashboard with hospital modules for patients, appointments, staff, pharmacy, billing, labs, triage, surgery, discharge, insurance, and reports.
- AI assistant route: `app/api/ai/chat/route.ts:17`
- Current AI tools are read-only: `lib/ai/tools.ts:78`
- Repository boundary exists for migration: `lib/repos/hospital.ts:27`
- Roles and access model: `lib/permissions.ts:5`
- Dependencies include OpenAI SDK: `package.json:19`
- Runtime AI provider/model/keys must stay in local env files, not git.

## 3. Guardrails
- Never commit API keys, Clerk secrets, Supabase service-role keys, Sarvam keys, or `.env.local`.
- Staff AI and patient AI must use separate credentials, separate audit logs, and separate data scopes.
- Clinical, billing, insurance, discharge, and medication actions require human approval.
- AI responses must say when access is denied instead of guessing.
- Keep PHI minimal in prompts, logs, and tool outputs.
- Use IDs and diffs in audit records; avoid dumping full patient records.

## 4. Workstream A - Supervised AI writes
Current state: staff AI can read through tools but should not mutate records yet.

### Required design
- Add mutation tools separately from read tools, for example:
  - `create_appointment`
  - `reschedule_appointment`
  - `create_bill`
  - `update_triage_status`
  - `advance_lab_status`
- Each mutation needs:
  - Zod input validation
  - role check through `lib/permissions.ts`
  - explicit user confirmation in UI
  - old/new value diff
  - audit event with approver identity
  - idempotency key for retries

### Confirmation flow
1. AI proposes a structured action.
2. UI shows old value, new value, affected IDs, and role permission result.
3. Human clicks approve or reject.
4. Only then does the tool execute.
5. Write an `ai_field_decisions` style event: accepted, edited, or rejected.

### Acceptance criteria
- Unauthorized roles cannot invoke mutation tools.
- Every mutation has trace ID, approver, timestamp, model/prompt version, and diff.
- Retried requests do not create duplicate appointments or bills.
- `tsc --noEmit` passes and the chat route still handles provider failures gracefully.

## 5. Workstream B - Supabase migration
Current state: `lib/repos/hospital.ts:27` defines repository interfaces with JSON implementations.

### Migration approach
1. Create Supabase tables matching repository entities:
   - patients
   - appointments
   - beds
   - prescriptions
   - lab_reports
   - bills
   - triage_queue
   - medicines
   - surgeries
   - discharges
   - insurance_claims
   - expenses
   - staff and leave requests
   - AI audit tables
2. Implement `Supabase*Repository` classes behind the existing interfaces.
3. Keep tool schemas unchanged.
4. Add a repository selector:
   - JSON for local/dev fallback
   - Supabase for shared environments
5. Migrate read paths first, then supervised writes.
6. Add Row Level Security before exposing patient data broadly.

### Acceptance criteria
- AI tools work without schema changes when repository implementation changes.
- No direct `@/data/hospital` imports remain in AI tools or API routes.
- RLS prevents cross-role and cross-patient access.
- Migration has forward and rollback scripts.

## 6. Workstream C - Clerk auth plus Supabase webhook
Use Clerk as identity provider and Supabase as data backend.

Reference:
- `https://supabase.com/docs/guides/auth/third-party/clerk`

### Implementation checklist
1. Create Clerk application and roles:
   - Admin
   - Management
   - Doctor
   - Nurse
   - Receptionist
   - Billing Staff
   - Pharmacist
   - Lab Tech
   - Patient for the patient app
2. Configure Supabase third-party auth with Clerk.
3. Add Clerk webhook to sync:
   - user created
   - user updated
   - user deleted
   - role changes
4. Store mapping:
   - Clerk user ID
   - hospital role
   - department
   - active status
   - patient ID where applicable
5. Replace local role switcher for authenticated flows with Clerk session role.
6. Keep local role emulation only for offline UI development if needed.
7. Protect:
   - Next.js routes
   - API routes
   - AI tools
   - Supabase queries

### Acceptance criteria
- Authentication is server-verified, not trust-client role values.
- AI route uses authenticated user and server-resolved role.
- Webhook failures are logged and retried safely.
- Deleted/deactivated users lose access immediately.

## 7. Workstream D - Supabase MCP with OpenCode
Use Supabase MCP for faster schema and data work.

### Setup
1. Add the Supabase MCP server to OpenCode MCP config.
2. Connect it to the correct Supabase project.
3. Prefer read/inspect operations first:
   - list tables
   - inspect schema
   - review RLS policies
   - check logs and advisories
4. Use local Supabase/CLI workflow for migrations where available.
5. Never paste service-role keys in chat.
6. Treat remote writes as production actions with explicit confirmation.

## 8. Workstream E - Patient application
Rohit will also build the patient-side application.

### Scope
- Patient signup/login through Clerk.
- Patient profile and linked patient record.
- Upcoming appointments and visit history.
- Prescriptions and lab reports scoped to that patient only.
- Bills and payment history scoped to that patient only.
- Follow-up booking and reminders.
- Support/messages scoped to that patient.

### Rules
- Patients can access only their own records.
- No staff dashboards, no cross-patient search, no bulk exports.
- Patient app should reuse repository interfaces but with patient-scoped queries and RLS.
- Keep patient UI simpler than staff UI.

## 9. Workstream F - Patient-side AI with Sarvam AI
Staff-side AI may remain on the current NVIDIA/OpenAI-compatible path. Patient-side AI calls will use Sarvam AI.

### Required architecture
- Create a separate patient AI client/adapter.
- Do not reuse staff NVIDIA credentials for patient traffic.
- Support patient use cases:
  - appointment help
  - prescription explanations
  - lab report explanations
  - bill explanations
  - follow-up reminders
  - multilingual support where Sarvam provides an advantage
- Keep patient AI read-scoped to the authenticated patient.
- Maintain separate audit logs for patient AI.
- Verify current Sarvam API authentication, models, language support, rate limits, pricing, and data-retention terms before handling PHI.

### Acceptance criteria
- Patient AI cannot access other patients.
- Patient AI cannot perform staff mutations.
- Every patient AI turn logs model, tools, accessed IDs, decision, and latency.
- Unsafe or uncertain clinical questions get a safe-completion plus doctor follow-up prompt.

## 10. Environment variables
Names only. Do not commit values.

- `NVIDIA_API_KEY`
- `AI_BASE_URL`
- `AI_MODEL`
- Clerk publishable key
- Clerk secret key
- Clerk webhook secret
- Supabase project URL
- Supabase anon key
- Supabase service-role key for server-only use
- Sarvam API key
- Sarvam model/voice settings if used

## 11. Definition of done
- Supervised AI writes work with approval and audit.
- Supabase repositories replace JSON without tool breakage.
- Clerk login controls staff and patient access.
- Supabase webhook keeps roles in sync.
- Patient app exposes only own-patient data.
- Patient AI uses Sarvam AI through a separate adapter and audit log.
- No secrets in git.
- Production build passes.
