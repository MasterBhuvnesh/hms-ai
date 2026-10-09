# patient-app

Planned patient-side application for hms-ai (not scaffolded yet).

Intended scope:
- Patient signup and login through Clerk.
- Profile and linked patient record.
- Upcoming appointments and visit history.
- Prescriptions and lab reports for that patient only.
- Bills and payment history for that patient only.
- Follow-up booking and reminders.
- Patient-side AI through a separate Sarvam AI adapter.

Rules:
- Patients can access only their own records.
- No staff dashboards, no cross-patient search, no bulk exports.
- Reuse the repository interfaces from `website/lib/repos` with patient-scoped queries and Row Level Security.
