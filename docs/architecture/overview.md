# Architecture Overview

## System Context Diagram
```mermaid
C4Context
    title System Context for SiteHookz
    Person(admin, "Platform Admin", "Manages the platform")
    Person(user, "Tenant User", "Uses a product (e.g. Education)")
    System(sitehookz, "SiteHookz Platform", "Multi-product SaaS Platform")
    System_Ext(email, "Email Service", "Sends emails")

    Rel(admin, sitehookz, "Manages tenants & platform settings")
    Rel(user, sitehookz, "Uses tenant applications")
    Rel(sitehookz, email, "Sends system emails")
```

## Container Diagram
```mermaid
C4Container
    title Container Diagram for SiteHookz
    Person(user, "User", "A user of the application")
    Container(marketing, "Marketing Web", "React", "Public site")
    Container(tenantApp, "Education Web", "React", "Tenant application")
    Container(api, "API Application", "NestJS", "Modular monolith backend")
    Container(worker, "Worker", "Node.js/BullMQ", "Background processing")
    ContainerDb(db, "Database", "PostgreSQL", "Stores user, tenant, and product data")
    ContainerDb(redis, "Redis", "Redis", "Queue state")

    Rel(user, marketing, "Visits", "HTTPS")
    Rel(user, tenantApp, "Uses", "HTTPS")
    Rel(tenantApp, api, "Makes API calls to", "JSON/HTTPS")
    Rel(api, db, "Reads from and writes to", "Prisma")
    Rel(api, redis, "Enqueues jobs in", "BullMQ")
    Rel(worker, redis, "Consumes jobs from", "BullMQ")
    Rel(worker, db, "Reads/writes job data", "Prisma")
```

## Request Flow
```mermaid
sequenceDiagram
    participant Client
    participant Helmet_CORS
    participant Middleware
    participant Guards
    participant Controller
    participant Service
    participant Database

    Client->>Helmet_CORS: HTTP Request
    Helmet_CORS->>Middleware: Security Headers / CORS check
    Middleware->>Guards: Request ID / Rate Limiting
    Guards->>Controller: Auth & Tenant & Permission Guards
    Controller->>Service: Validate DTO & Route
    Service->>Database: Execute Business Logic (Prisma)
    Database-->>Service: Return Data
    Service-->>Controller: Return Result
    Controller-->>Client: HTTP Response
```

## Auth Flow
```mermaid
sequenceDiagram
    participant User
    participant App
    participant API
    participant DB

    User->>App: Submits login credentials
    App->>API: POST /api/v1/auth/login
    API->>DB: Verify credentials
    DB-->>API: Valid
    API->>API: Generate Access JWT & Refresh Token Hash
    API->>DB: Store Refresh Token Hash
    API-->>App: Access Token (JSON) + HttpOnly Refresh Cookie
    App-->>User: Logged in state
```

## Organization Creation Flow
```mermaid
sequenceDiagram
    participant User
    participant API
    participant DB

    User->>API: POST /api/v1/platform/organizations
    API->>DB: BEGIN Transaction
    API->>DB: Create Organization
    API->>DB: Create EducationOrganizationProfile
    API->>DB: Provision System Roles
    API->>DB: Create User Membership
    API->>DB: Assign Owner Role
    API->>DB: COMMIT Transaction
    API-->>User: Return Organization Details
```

## Invitation Acceptance Flow
```mermaid
sequenceDiagram
    participant User
    participant API
    participant DB

    User->>API: POST /api/v1/platform/invitations/accept (token)
    API->>DB: Validate Token & Expiry
    API->>DB: Find existing UserAccount or require Registration
    API->>DB: BEGIN Transaction
    API->>DB: Create OrganizationMembership
    API->>DB: Copy Roles from Invitation to Membership
    API->>DB: Mark Invitation as ACCEPTED
    API->>DB: COMMIT Transaction
    API-->>User: Success
```

## Database ER Diagram (Simplified)
```mermaid
erDiagram
    ORGANIZATION ||--o{ BRANCH : has
    ORGANIZATION ||--o{ ORGANIZATION_MEMBERSHIP : has
    ORGANIZATION ||--o{ ROLE : defines
    USER_ACCOUNT ||--o{ ORGANIZATION_MEMBERSHIP : belongs_to
    USER_ACCOUNT ||--o{ AUTH_SESSION : has
    ROLE ||--o{ ROLE_PERMISSION : contains
    PERMISSION ||--o{ ROLE_PERMISSION : included_in
    ORGANIZATION_MEMBERSHIP ||--o{ ROLE_ASSIGNMENT : has
    ROLE ||--o{ ROLE_ASSIGNMENT : assigned_to
    BRANCH ||--o{ ROLE_ASSIGNMENT : scoped_to
    ORGANIZATION ||--o| EDUCATION_ORGANIZATION_PROFILE : details
    ORGANIZATION ||--o{ ACADEMIC_SESSION : has
```
