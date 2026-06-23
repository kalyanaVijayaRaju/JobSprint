# JobSprint Microservices Migration Roadmap

The migration uses small, deployable milestones. Each day ends with one focused
commit on a feature branch. A service is deployed only after its health checks,
tests, container image, configuration, and observability are in place.

## Delivery sequence

| Day | Milestone | Deployable outcome |
| --- | --- | --- |
| 1 | Production backend foundation | Validated configuration, dependency-aware startup, health probes, graceful shutdown, and backend container |
| 2 | Identity module API | Registration, login, JWT access tokens, refresh-token rotation, and role authorization |
| 3 | Identity service extraction | Independent identity database, image, Kubernetes manifests, and gateway route |
| 4 | Profile and company APIs | Candidate/recruiter profiles, company membership, and ownership rules |
| 5 | Job service | Job lifecycle, search, Redis caching, independent database, and gateway route |
| 6 | Application service | Application submission, ATS workflow, idempotency, and independent database |
| 7 | Kafka platform | Event envelope, transactional outbox, retries, dead-letter topics, and consumer idempotency |
| 8 | Notification and audit services | Event-driven notifications and immutable audit records |
| 9 | Engagement service | Saved jobs and job-alert subscriptions |
| 10 | Kubernetes production baseline | Ingress, autoscaling, network policies, secrets, telemetry, and rollout strategy |

## Commit policy

- One concern per commit using `type(scope): summary`.
- Never commit environment files, credentials, signing keys, or kubeconfig files.
- Keep database ownership exclusive to its service.
- Require passing checks before pushing.
- Tag the first production-ready release of each extracted service.

## Deployment gates

Every service must have:

1. Liveness and readiness endpoints.
2. Validated environment configuration.
3. Graceful shutdown behavior.
4. Unit, integration, and API contract checks.
5. A non-root, immutable container image.
6. Resource requests and limits.
7. Structured logs, metrics, and trace propagation.
8. A rollback path and database compatibility plan.
