# Phase 6 Discovery & Architecture Report: Real-Time Refresh

**Repository**: `C:\Users\A\Documents\Kaushal Yadav\Dashboard\atlas-operations-command`  
**Date**: September 5, 2026  
**Status**: READ-ONLY Discovery & Architecture Artifact (No Implementation Authorized)  

---

## 1. Repository Baseline

The repository baseline was inspected and verified using read-only repository inspection tools:

- **Repository Root**: `C:/Users/A/Documents/Kaushal Yadav/Dashboard`
- **Active Git Branch**: `main`
- **Latest Verified Commit**: `b55f00d` (Phase 5B complete commit pushed to `origin/main`)
- **Git Remotes**: `origin https://github.com/kaushlendrayadav079906/Dashboard_1-.git`
- **Phase 5B Status**: Full AI Risk Engine, Risk persistence, AiRecommendedAction, ExecutiveBriefing, and asynchronous AI analysis workflow implemented, verified, and audited.
- **Alembic State**: `5b01a2b3c4d5 (head)` (Phase 5B risk persistence models)
- **Baseline Test Suite Count**: 122 tests passing across Phase 1–5B (0 failures, 0 errors, 0 new warnings).
- **Working Tree Status**: Clean (`nothing to commit, working tree clean`).

---

## 2. Roadmap Requirements for Phase 6

Based on the authoritative architectural specifications (`Atlas_Operations_Command_Rebuild_Roadmap.docx`, `docs/backend-database-architecture.md`, and existing Phase 3/4/5 deliverables):

### Core Phase 6 Objectives:
1. **Real-Time Operational Dashboard Refresh**: Provide lightweight, highly responsive, low-latency endpoints delivering live operational metrics, health indicators, and aggregated business telemetry to frontend dashboards.
2. **Deterministic Data Separation**: Separate live high-frequency operational metrics from heavyweight generative AI workflows.
3. **Optimized Polling & Cache Architecture**: Support configurable client polling intervals (e.g. 15s to 60s or lightweight heartbeat updates) without overloading the database engine or spawning unnecessary threads.
4. **AI/LLM Thrashing Prevention**: Absolute isolation between real-time metric refresh and Gemini LLM token execution. Live dashboard refreshes **MUST NOT** trigger Gemini or run synchronous AI analysis.
5. **Multi-Tenant Scoping**: All real-time telemetry and summary streams must strictly enforce `AuthContext.company_id` scoping to guarantee zero cross-tenant data leakage.

### Explicitly Excluded from Phase 6:
- **Phase 7**: Multi-currency conversion engines, FX rate services, GST calculation, Indian/regional tax localization.
- **Phase 8**: Direct live SAP RFC/BAPI connectors, ERP synchronization daemons.
- **Phase 9**: Database-engine Row-Level Security (RLS) policies, advanced penetration hardening, global audit compliance vault.

---

## 3. Existing Backend Inspection & Reusability

An audit of the backend repository reveals rich capabilities available for reuse in Phase 6:

1. **FastAPI & Router Layer (`backend/app/api/v1/`)**:
   - Existing routers (`business.py`, `factory.py`, `reports.py`, `ai.py`, `upload.py`) demonstrate consistent dependency injection with `get_db` and `get_current_user_context`.
   - Phase 6 can introduce a dedicated `/realtime` or `/dashboard/live` router under `/api/v1/` and `/api/`.

2. **Phase 3 Business Repositories (`backend/app/repositories/`)**:
   - `BusinessDataRepository`: Provides aggregate queries for revenue, expenditures, margins, active factory counts, customer rankings, and product breakdowns.
   - `FactoryRepository`: Provides factory listings, operational statuses, and site-level metrics.
   - Reusable for synthesizing instantaneous snapshot telemetry without schema modifications.

3. **Phase 5B Persistent Repositories (`backend/app/repositories/risk.py`)**:
   - `RiskPersistenceRepository`: Provides fast indexed queries for active risks (`get_risks`), pending recommendations (`get_actions`), and latest briefings (`get_latest_briefing`).
   - Enables real-time summary cards to display the latest persisted AI insights instantly (0ms LLM latency, 0 token consumption).

4. **Authentication & Multi-Tenant Security (`backend/app/api/v1/auth.py`, `app/schemas/auth.py`)**:
   - `AuthContext`: Contains `user_id`, `company_id`, `email`, and `roles`.
   - Guarantees that all real-time queries filter by `company_id == auth.company_id`.

---

## 4. Real-Time Architecture & Refresh Methodology

### Polling vs. Push Determination:
1. **HTTP Polling & Lightweight Delta Endpoints (Authoritative & Recommended)**:
   - Modern RESTful polling (e.g., intervals of 15s–30s or conditional `If-Modified-Since` / ETag validation) provides maximum compatibility, zero stateful connection leaks in serverless/container environments, and simple load balancing.
   - Standard HTTP GET with lightweight aggregated SQL queries executes in <10ms.
2. **Server-Sent Events (SSE) / WebSockets (Optional Enhancement / Phase 11)**:
   - Roadmap Phase 11 explicitly reserves full persistent WebSocket / Celery message queues.
   - Phase 6 focuses on resilient, low-latency, stateless dashboard refresh APIs that serve frontend pollers without overhead.

### Data Refresh Boundaries:
| Metric / Component | Refresh Strategy | AI Invocation? | Source of Truth |
|---|---|---|---|
| **Active Factory Status** | Live query / Polling (15s–60s) | **NO** | `factories` table (`status == 'active'`) |
| **Financial Pulse (Revenue/Burn)** | Live query / Polling (30s–60s) | **NO** | `financial_transactions` aggregate |
| **Stockout & Inventory Alerts** | Live query / Polling (30s–60s) | **NO** | `inventory_items` table |
| **Active Risk Counts & Severity** | Live query / Polling (30s–60s) | **NO** | `risks` table (`status == 'active'`) |
| **Latest Executive Briefing** | Live query / Polling (60s+) | **NO** | `executive_briefings` (latest row) |
| **Pending Recommended Actions** | Live query / Polling (30s–60s) | **NO** | `ai_recommended_actions` (`pending`) |
| **AI Predictive Risk Engine** | Explicit Trigger / Async Job | **YES (Only when explicitly triggered)** | `POST /api/v1/ai/run-analysis` |

---

## 5. Phase 5B Interaction & AI Thrashing Protection

### The Thrashing Problem:
If a dashboard with 50 active users polls a risk evaluation endpoint every 15 seconds, and that endpoint invokes Gemini:
- 50 users $\times$ 4 requests/min = 200 Gemini LLM calls/minute.
- Outcome: Immediate API quota exhaustion (HTTP 429), prohibitive cloud token costs, and high database connection pool strain.

### Phase 6 Strict Guardrails:
1. **Zero LLM Invocations on Polling Endpoints**: Real-time refresh endpoints query **only** local database tables and indexed aggregates (`factories`, `financial_transactions`, `risks`, `ai_recommended_actions`, `executive_briefings`).
2. **Read-Only from Persisted Intelligence**: When the real-time dashboard renders the AI summary card, it reads the latest record from `executive_briefings` and active items from `risks`.
3. **Decoupled AI Triggers**: AI analysis is only triggered:
   - On explicit user click of "Run AI Analysis" (`POST /api/v1/ai/run-analysis`).
   - On completion of a new data ingestion/file upload (Phase 4 integration).
4. **Deterministic Heuristics for Live Badge Changes**: If live factory downtime increases between AI runs, deterministic health indicators update instantly on the UI without requiring an LLM re-run.

---

## 6. Database Impact Analysis

### Schema Changes Required: **NONE (0 Migrations)**
- **Existing Tables Utilized**:
  - `companies`
  - `factories`
  - `financial_transactions`
  - `inventory_items`
  - `kpi_snapshots`
  - `risks` (Phase 5B)
  - `ai_recommended_actions` (Phase 5B)
  - `executive_briefings` (Phase 5B)
- **Indexes Already Present**:
  - `ix_risks_company_id`, `ix_risks_severity`, `ix_risks_status`
  - `ix_ai_recommended_actions_company_id`, `ix_ai_recommended_actions_status`
  - `ix_executive_briefings_company_id`, `ix_executive_briefings_generated_at`
  - `ix_factories_company_id`, `ix_factories_status`
  - `ix_financial_transactions_company_id`, `ix_financial_transactions_date`
- **Conclusion**: The existing Phase 3 and Phase 5B database schema is fully indexed and optimized for real-time aggregation queries. No new migrations or DDL changes are needed.

---

## 7. API Design for Phase 6

### Endpoint 1: Comprehensive Live Dashboard Summary
- **HTTP Method**: `GET`
- **Path**: `/api/v1/realtime/summary` (and `/api/realtime/summary`)
- **Authentication**: Bearer JWT (`get_current_user_context`)
- **RBAC**: Any authenticated company user (Viewer, Operator, Admin)
- **Query Parameters**:
  - `factory_id`: Optional[UUID]
- **Response Model**: `RealtimeDashboardSummaryResponse`
  ```json
  {
    "company_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "timestamp": "2026-09-05T16:30:00Z",
    "system_status": "OPERATIONAL",
    "operational_pulse": {
      "total_factories": 8,
      "active_factories": 7,
      "inactive_factories": 1,
      "operational_health_pct": 87.5
    },
    "financial_pulse": {
      "total_revenue": 12500000.00,
      "total_expenditure": 9800000.00,
      "net_profit": 2700000.00,
      "operating_margin_pct": 21.6
    },
    "risk_summary": {
      "active_risk_count": 4,
      "critical_count": 1,
      "high_count": 1,
      "medium_count": 2,
      "low_count": 0,
      "overall_composite_score": 42.5,
      "overall_severity": "MEDIUM"
    },
    "pending_actions_count": 3,
    "latest_briefing_timestamp": "2026-09-05T14:15:00Z",
    "data_version": "2026-09-05-163000"
  }
  ```
- **Error Handling**: 401 Unauthorized, 403 Forbidden.

### Endpoint 2: Operational Health Stream / Pulse
- **HTTP Method**: `GET`
- **Path**: `/api/v1/realtime/operational-health`
- **Authentication**: Bearer JWT (`get_current_user_context`)
- **Purpose**: Ultra-lightweight endpoint for 10s–15s status badges and header heartbeats.
- **Response Model**: `RealtimeOperationalHealthResponse`
  ```json
  {
    "status": "HEALTHY",
    "active_plants": 7,
    "total_plants": 8,
    "active_critical_alerts": 1,
    "last_data_sync": "2026-09-05T16:29:45Z"
  }
  ```

### Endpoint 3: Active Alert & Notification Feed
- **HTTP Method**: `GET`
- **Path**: `/api/v1/realtime/alerts`
- **Authentication**: Bearer JWT (`get_current_user_context`)
- **Query Parameters**:
  - `severity`: Optional[str] (e.g. `CRITICAL`, `HIGH`)
  - `limit`: int = 10
- **Purpose**: Feeds the real-time top navigation bell icon and alert drawer.
- **Data Source**: Aggregated active `risks` with status `active` and highest severity.

---

## 8. Performance & Thrashing Analysis

1. **Query Optimization**:
   - All real-time queries aggregate over indexed columns (`company_id`, `status`, `transaction_date`).
   - Queries use SQL `COUNT()` and `SUM()` directly in MySQL engine rather than loading full model instances into Python memory.
2. **Execution Latency**:
   - Aggregated MySQL query execution time is expected to be **< 8ms**.
3. **Database Connection Pool**:
   - Uses SQLAlchemy connection pool with fast checkout and release.
   - Clean disconnection ensures no connection leaks during rapid frontend polling cycles.
4. **Caching Strategy (In-Memory / Optional Redis)**:
   - For high-concurrency environments, responses can be cached for 5–10 seconds per `company_id`.
   - Subsequent poll requests within the window receive the cached JSON instantly without hitting MySQL.

---

## 9. Security & Tenant Isolation

- **JWT Validation**: Every real-time request must pass standard `get_current_user_context` dependency.
- **Tenant Confinement**:
  - `db.query(...).filter(Model.company_id == auth.company_id)` is mandatory on every database touchpoint.
  - Zero client-supplied company parameters are trusted.
- **IDOR Protection**: If `factory_id` is supplied, the service explicitly validates `factory.company_id == auth.company_id` before returning data.
- **Data Sanitization**: No credentials, hashes, or infrastructure configurations are exposed in telemetry responses.

---

## 10. Testing Strategy

### Test Suites to Implement in Phase 6:
1. **Authentication & Authorization Tests**:
   - Unauthenticated requests rejected with HTTP 401.
   - Inactive user tokens rejected.
2. **Tenant Isolation Tests**:
   - Company A user receives only Company A telemetry.
   - Company B metrics cannot be accessed or inferred.
3. **Correctness Tests**:
   - `operational_pulse` correctly reflects active/inactive factory changes.
   - `financial_pulse` matches committed transaction sums.
   - `risk_summary` accurately reflects active risk counts and severity buckets.
4. **Zero-AI Invocation Verification**:
   - Mock Gemini provider verified to receive **0** calls during polling requests.
5. **Edge Cases**:
   - Empty company (0 factories, 0 transactions, 0 risks) returns clean zero-state without 500 errors.

**Estimated Phase 6 Test Count**: 12–16 new comprehensive tests, bringing the total suite to **~134–138 tests**.

---

## 11. SAP Integration Boundary

- Real-time refresh operates strictly on the existing normalized MySQL operational data.
- Direct SAP RFC/BAPI synchronization is a separate future enterprise connector (Phase 8).
- When SAP-originated data is uploaded or staged (via Phase 4), real-time refresh automatically reflects the newly ingested records upon database commit.

---

## 12. Expected Implementation Files

### Files to CREATE:
- `backend/app/schemas/realtime.py` (Pydantic models for live summary, health pulse, alerts)
- `backend/app/repositories/realtime.py` (Optimized aggregation queries for dashboard telemetry)
- `backend/app/services/realtime.py` (Real-time telemetry service orchestration)
- `backend/app/api/v1/realtime.py` (FastAPI router for real-time endpoints)
- `backend/tests/test_realtime_api.py` (Unit and integration test suite for real-time endpoints)

### Files to MODIFY:
- `backend/app/main.py` (Register `realtime_router` under `/api/v1` and `/api`)

### Database Migrations:
- **NONE** (0 migrations required).

---

## 13. Implementation Sequence

1. **Step 1: Schemas**: Define `RealtimeDashboardSummaryResponse`, `OperationalPulse`, `FinancialPulse`, `RiskPulse`, and `RealtimeAlertItem` in `app/schemas/realtime.py`.
2. **Step 2: Repository**: Implement optimized SQL aggregation methods in `app/repositories/realtime.py`.
3. **Step 3: Service**: Implement `RealtimeService` in `app/services/realtime.py` with zero-AI invocation guarantees and tenant isolation.
4. **Step 4: API Router**: Create `app/api/v1/realtime.py` and register in `app/main.py`.
5. **Step 5: Testing**: Implement comprehensive test suite in `tests/test_realtime_api.py` validating metrics, tenant boundaries, and AI non-triggering.
6. **Step 6: Audit & Verification**: Execute complete test suite (expected 134+ tests passing) and generate Phase 6 audit report.

---

## 14. Phase Boundary Exclusions

- Multi-currency / FX translation engines (Phase 7).
- Indian GST tax breakdown (Phase 7).
- Live SAP direct ERP connector (Phase 8).
- Celery / Redis persistent distributed workers (Phase 11).
- Database Row Level Security (RLS) policies (Phase 9).

---

## 15. Risks & Open Questions

- **Question**: Is frontend expecting a single composite dashboard endpoint or separate modular endpoints?
  - **Resolution**: Provide a single comprehensive `/realtime/summary` endpoint to minimize HTTP request overhead on client polling, while providing modular sub-endpoints (`/realtime/operational-health`, `/realtime/alerts`) for lightweight widgets.
- **Risk**: Stale risk scores if database data changes without running AI analysis.
  - **Resolution**: Live deterministic scores update in real-time based on latest transactions, while qualitative AI narratives display their `generated_at` timestamp clearly.

---

## 16. Final Readiness Assessment

The Phase 6 discovery analysis is complete, fully grounded in the existing repository architecture, and strictly respects all phase boundaries, multi-tenant isolation rules, and AI cost/quota protections.

**READY FOR PHASE 6 IMPLEMENTATION**
