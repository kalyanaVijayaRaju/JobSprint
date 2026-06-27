# ADR 001: Free and Local-First Infrastructure

## Status

Accepted

## Context

JobSprint is being built as a portfolio-grade production project without relying
on paid third-party API keys or commercial managed services during development.
Future services must remain runnable on a local machine using open-source tools.

## Decision

All new integrations must provide a free/local adapter first. Paid cloud
providers may be added later as optional production adapters, but they must not
be required for local development, tests, or the default deployment path.

## Default adapters

| Concern | Default choice | Notes |
| --- | --- | --- |
| Database | Local MongoDB | Can run directly or through Docker later |
| Cache | Local Redis | Optional until caching is introduced |
| Events | Local Kafka or Redpanda | Redpanda is preferred for lightweight local development |
| Email | Console logger | Mailpit can be added for inbox-style local testing |
| File storage | Local filesystem | MinIO can be added when S3-compatible behavior is needed |
| JWT signing | Local secret or generated key pair | No external auth provider required |
| Kubernetes | kind or minikube | Optional until Kubernetes manifests are introduced |
| Observability | OpenTelemetry, Prometheus, Grafana | No hosted monitoring required |

## Rules for future code

1. Do not require AWS, SendGrid, Stripe, Datadog, or any paid-provider key for
   default development.
2. Environment variables for paid providers must be optional and documented as
   production-only alternatives.
3. Tests must run without network access to commercial services.
4. New services must start with local `.env.example` defaults.
5. Docker Compose should be the first shared runtime target before cloud
   deployment.
6. Secrets must never be committed to Git.

## Consequences

- Development stays affordable and reproducible.
- The architecture remains portable across local Docker, free-tier platforms,
  and paid production providers later.
- Provider-specific code must be isolated behind adapters, which slightly
  increases structure but keeps the domain code clean.
