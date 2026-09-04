# Phase 5 Discovery & Readiness Report: AI / Gemini Risk Engine

## 1. Workspace Verification
- **Repository**: `C:\Users\A\Documents\Kaushal Yadav\Dashboard\atlas-operations-command`
- **Active Branch**: `main`
- **Latest Verified Commit**: `4815985` (`feat(backend): complete phase 4 file upload and data ingestion`)
- **Working Tree**: Clean (`nothing to commit, working tree clean`)
- **Verification Gate**: Confirmed. Phase 4 passed all implementation and verification requirements.

## 2. Phase 1–4 Baseline
- **Test Suite**: `62 passed, 0 failed, 0 errors` across 17 test modules.
- **Alembic State**: `current == heads` (`160311329577`).
- **Core Architecture Verified**:
  - **Phase 1 (Foundation)**: FastAPI, SQLAlchemy declarative models, PyMySQL, Alembic migrations, Multi-tenant schema (`Company`, `User`, `Role`, `UserRole`).
  - **Phase 2 (Auth & RBAC)**: Argon2id password hashing, JWT authentication (`AuthContext`, `get_current_user_context()`), Role-based access control (`RequireRole`), tenant isolation.
  - **Phase 3 (Business Domain & Reporting)**: `Factory`, `Product`, `Customer`, `Vendor`, `InventoryItem`, `FinancialTransaction`, `KpiSnapshot`, Factory APIs, Business APIs, Aggregation/Reporting endpoints.
  - **Phase 4 (File Upload & Ingestion)**: `FileUpload`, `StagedRecord`, abstract `StorageService` (`LocalStorageService`), robust multi-format parsers (CSV, JSON, XML via `defusedxml`, TXT, XLSX via read-only `openpyxl`), transactional ingestion, duplicate prevention via tenant-scoped SHA-256 hash.

## 3. Phase 5 Roadmap Requirements
Review of project specifications and backend architecture indicates the core objectives of Phase 5 (AI / Gemini Risk Engine & Intelligence):

### Supported by Roadmap
1. **AI Risk Engine & Detection**: Analyze business metrics (financial transactions, factory health, KPI snapshots, inventory levels) to identify operational and financial risks.
2. **Risk Scoring & Categorization**: Compute structured risk scores (e.g., Low, Medium, High, Critical) with explanatory factors and drivers.
3. **AI Recommendations**: Provide actionable operational/financial mitigation strategies based on detected risk patterns and business anomalies.
4. **Executive Briefing / Summary**: Generate concise executive briefings synthesizing overall company operational status, KPI trends, and key risk highlights.
5. **AI Provider Abstraction**: Implement a decoupled provider interface (e.g., `GeminiProvider` / `LLMProvider`) configurable via environment variables (`GEMINI_API_KEY`, `GEMINI_MODEL`, `GEMINI_TIMEOUT_SECONDS`) without vendor lock-in.
6. **Tenant Isolation in AI Processing**: Guarantee zero cross-tenant data leakage. All data retrieved for AI synthesis must be strictly scoped by `auth.company_id`.

### Not Defined / Needs Clarification (Deferred / Architecture Decisions)
1. **Interactive AI Chat**: Interactive conversational multi-turn chat sessions are not explicitly required for the Phase 5 core risk engine and should remain stateless or decoupled unless required.
2. **Fixed Deterministic Risk Formulas**: The exact heuristic weighting vs. LLM-driven risk scoring is an implementation decision; a hybrid approach (deterministic pre-aggregation + LLM analytical explanation) is recommended for reliability.
3. **Direct Database Persistence of AI Outputs vs. On-Demand**: Persisting generated risk assessments and briefings enables historical tracking and avoids repetitive LLM token costs.

## 4. Existing Data Sources
Phase 5 consumes data generated and managed across Phase 3 and Phase 4 without modifying their underlying domain models:
- **`FinancialTransaction`**: Revenue, expenditures, margins, customer transaction volume, and vendor payments.
- **`Factory` & `KpiSnapshot`**: Factory status, active sites, efficiency, downtime, and operational metrics.
- **`InventoryItem`**: Stock quantities, inventory values, shortages, and potential holding risks.
- **`Customer` & `Vendor`**: Concentration risks (e.g., revenue dependency on single customer or supply risk with vendors).
- **`FileUpload` & `StagedRecord`**: Audit trail of recent data ingestions feeding current operational state.
- **`BusinessDataRepository` / `FactoryRepository`**: Existing optimized aggregation routines (e.g., `get_monthly_revenue_expenditure`, `get_top_customers`, `get_sales_by_product`, `get_financials`).

## 5. Gemini Integration Boundary
- **Architecture**: Decoupled interface pattern.
  - `BaseAIProvider` (Abstract Base Class) defining `generate_risk_analysis()`, `generate_executive_briefing()`, `generate_recommendations()`.
  - `GeminiAIProvider` implementing Google Gemini API SDK / REST client with prompt formatting and structured JSON output parsing.
  - `MockAIProvider` / `FallbackAIProvider` for test isolation and offline resilience.
- **Configuration (via `app.core.config.Settings`)**:
  - `GEMINI_API_KEY: Optional[str] = None`
  - `GEMINI_MODEL: str = "gemini-1.5-pro"` (or `gemini-1.5-flash`)
  - `GEMINI_TIMEOUT_SECONDS: int = 30`
  - `AI_FALLBACK_ENABLED: bool = True`
- **Resilience & Error Handling**:
  - Provider timeouts handled gracefully.
  - Rate limiting / 429 status code handling with retries/exponential backoff.
  - Graceful fallback when API key is unconfigured or upstream service is unreachable.
  - Zero hardcoded credentials or API keys.

## 6. AI Safety & Data Security
- **Tenant Confinement**: Prompts and context bundles are built strictly from database queries filtered on `company_id == auth.company_id`.
- **Exclusion of Sensitive Credentials**: No user passwords, password hashes, JWT secrets, database connection strings, or system configs are ever passed to prompts.
- **Data Aggregation & Minimization**: Instead of streaming raw row-level records, aggregate metrics, summary statistics, and anonymized KPI identifiers are fed into the LLM to minimize token consumption and protect PII.
- **Prompt Injection Defense**: Business data injected into prompt templates is sanitized and treated strictly as data payloads with explicit system prompt constraints.

## 7. AI Risk Engine Architecture
- **Risk Evaluation Dimensions**:
  1. *Financial Risk*: High expenditure-to-revenue ratio, negative cash flow trends, severe customer concentration.
  2. *Operational Risk*: Inactive or underperforming factories, falling KPI snapshot metrics.
  3. *Supply & Inventory Risk*: Low stock levels on key products, vendor dependency.
- **Scoring Pipeline**:
  1. *Data Extraction*: Repository queries aggregate tenant metrics for the requested period/scope.
  2. *Deterministic Baseline Scoring*: Pre-calculate baseline metrics (e.g., margin %, variance %, count of anomalies).
  3. *LLM Qualitative Enrichment*: Send sanitized aggregates to `GeminiProvider` for root-cause synthesis, qualitative risk rating, and natural language explanations.
  4. *Structured Response*: Standardized Pydantic schema output containing score, severity, risk factors, and summary.

## 8. Recommendation Architecture
- **Trigger**: Synthesized from identified risk factors and business report aggregates.
- **Structure**:
  - Actionable title and concise description.
  - Impact level (High / Medium / Low).
  - Target domain (Financial, Operational, Supply Chain).
  - Estimated urgency / time horizon.

## 9. Executive Briefing Architecture
- **Scope**: Company-wide or factory-specific executive narrative.
- **Structure**:
  - Period summary (Month/Quarter/Year-to-date).
  - Financial health narrative.
  - Operational highlights & bottlenecks.
  - Top 3 strategic recommendations.

## 10. Chat Requirements Assessment
- **Status**: Not explicitly mandated as a Phase 5 blocking requirement.
- **Recommendation**: Focus Phase 5 on the core Risk Engine, Structured Recommendations, and Executive Briefings. If conversational query capabilities are added, ensure they use stateless prompt-response patterns respecting `AuthContext`.

## 11. Required APIs (Proposed Specification)
All endpoints require standard JWT authentication (`AuthContext`) and RBAC authorization:

1. `GET /api/v1/ai/risk-analysis`
   - **Auth**: `get_current_user_context` (Admin, Operator, Viewer, Management)
   - **Params**: `factory_id` (optional), `period` (optional)
   - **Output**: `RiskAnalysisResponse` (overall risk score, severity level, categorized risk factors, summary).
2. `GET /api/v1/ai/recommendations`
   - **Auth**: `get_current_user_context`
   - **Params**: `limit: int = 5`
   - **Output**: `List[RecommendationResponse]` (title, category, priority, rationale, action items).
3. `GET /api/v1/ai/briefing`
   - **Auth**: `get_current_user_context`
   - **Params**: `year: Optional[int]`, `month: Optional[int]`
   - **Output**: `ExecutiveBriefingResponse` (summary, key metrics overview, operational status, generated_at).
4. `POST /api/v1/ai/risk-analysis/generate`
   - **Auth**: `RequireRole("admin")`
   - **Payload**: `RiskAnalysisGenerateRequest`
   - **Output**: Triggers fresh evaluation and persists/updates snapshot.

## 12. Required Database Changes
- **Alembic Migration for Phase 5**:
  - Optional persistence table: `ai_risk_assessments`
    - `id` (UUID, PK)
    - `company_id` (UUID, FK -> companies.id)
    - `factory_id` (UUID, FK -> factories.id, nullable)
    - `risk_score` (Numeric(5, 2))
    - `risk_level` (String(50) - Low, Medium, High, Critical)
    - `summary` (Text)
    - `details` (JSON)
    - `created_at`, `updated_at`
  - Optional persistence table: `ai_executive_briefings`
    - `id` (UUID, PK)
    - `company_id` (UUID, FK -> companies.id)
    - `period_year` (Integer)
    - `period_month` (Integer)
    - `content` (Text)
    - `highlights` (JSON)
    - `created_at`, `updated_at`

## 13. Authentication & Authorization
- Enforce `get_current_user_context` on all read endpoints.
- Enforce `RequireRole("admin")` on explicit generation / re-calculation endpoints if resource-intensive.
- Ensure strict multi-tenant boundary checks across all queries.

## 14. Tenant Isolation
- Every query passed to repositories includes `company_id = auth.company_id`.
- Foreign key models (`Factory`, `FinancialTransaction`, `KpiSnapshot`) are validated against `company_id` before inclusion in AI context.
- No cross-tenant caching or data sharing.

## 15. Provider Configuration
- Environment variables in `.env` / `.env.example`:
  ```ini
  GEMINI_API_KEY=
  GEMINI_MODEL=gemini-1.5-flash
  GEMINI_TIMEOUT_SECONDS=30
  AI_MOCK_FALLBACK=true
  ```
- Graceful mock provider for offline local testing and CI test suite without requiring real external API keys.

## 16. Error Handling
- Upstream LLM timeout: Return 504 or fallback structured calculation.
- Upstream LLM rate limit (429): Backoff retry or fallback to deterministic assessment.
- Invalid LLM JSON response: Graceful parser error handling with raw fallback summary.
- Missing configuration: Clear log warning and fallback to deterministic engine if `AI_MOCK_FALLBACK=true`.

## 17. Phase Scope Boundaries
The following components are strictly excluded from Phase 5:
- **Phase 6**: WebSockets, 3-second polling, live dashboard workers.
- **Phase 7**: Localization, GST calculation, multi-currency conversion engines.
- **Phase 9**: Row-level security (RLS), comprehensive audit logging tables, production deployment, UAT, load testing.

## 18. Open Questions & Implementation Decisions
1. *LLM Structured Output*: Use Pydantic JSON mode / function calling via Google Gemini SDK or standard prompt JSON parsing with Pydantic validation.
2. *Persisted vs Dynamic*: Persisting risk snapshots enables fast dashboard loading without incurring repeated LLM latency on every page refresh.

## 19. Implementation Readiness
- All Phase 1–4 foundations are completely verified and sound.
- Business data repositories and services are ready to supply aggregated metrics.
- Multi-tenant architecture and auth context are in place.

---

### Final Discovery Verdict
**READY FOR PHASE 5 IMPLEMENTATION**
