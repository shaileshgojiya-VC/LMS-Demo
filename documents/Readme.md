# Inji Stack — Comprehensive Research Documentation

> **Source**: [docs.inji.io](https://docs.inji.io)  
> **Compiled**: May 2026  
> **Purpose**: Deep-dive reference covering plugins, modularity, external data sources, VC formats, sandbox, and platform integration

---

## What Is This Documentation?

This package is a structured, research-grade reference built from the official Inji documentation and codebase exploration. It is designed for developers and integrators who want to go beyond the surface of the Inji stack and understand how to use it for real-world platform integrations, extend it with custom plugins, and issue verifiable credentials across different formats.

---

## Document Index

| # | File | What It Covers |
|---|------|----------------|
| 1 | `01-overview/inji-stack-overview.md` | What Inji is, the Triangle of Trust, all three core modules |
| 2 | `02-plugins-and-modules/plugin-system.md` | Plugin architecture, types, interfaces, existing plugins |
| 3 | `02-plugins-and-modules/modularity-guide.md` | How to select, compose and deploy modules independently |
| 4 | `03-external-data-sources/connecting-data-sources.md` | PostgreSQL, CSV, API, custom plugin integration |
| 5 | `04-vc-formats/vc-formats-and-implementation.md` | JSON-LD, SD-JWT, mDoc, mDL, signing algorithms |
| 6 | `05-sandbox/sandbox-exploration.md` | Sandbox setup, Docker Compose, walkthroughs |
| 7 | `06-platform-integration/integration-patterns.md` | How to integrate Inji into your own platform |
| 8 | `07-pre-auth-flow/pre-auth-code-flow.md` | Pre-authorized code flow without eSignet |
| 9 | `08-deployment/deployment-guide.md` | Full Kubernetes deployment from scratch |
| 10 | `09-architecture/system-architecture.md` | Component diagrams, layers, key manager |

---

## Quick Navigation by Role

**You are a developer integrating Inji into your platform:**  
→ Start with `06-platform-integration/integration-patterns.md`  
→ Then `02-plugins-and-modules/plugin-system.md`  
→ Then `07-pre-auth-flow/pre-auth-code-flow.md`

**You are evaluating Inji in a sandbox:**  
→ Start with `05-sandbox/sandbox-exploration.md`  
→ Then `04-vc-formats/vc-formats-and-implementation.md`

**You are a DevOps / infrastructure engineer:**  
→ Start with `08-deployment/deployment-guide.md`  
→ Then `09-architecture/system-architecture.md`

**You are a data engineer connecting your registry:**  
→ Start with `03-external-data-sources/connecting-data-sources.md`  
→ Then `02-plugins-and-modules/modularity-guide.md`

---

## Key Repositories

| Repository | Purpose |
|-----------|---------|
| [mosip/inji-certify](https://github.com/mosip/inji-certify) | Core credential issuance engine |
| [mosip/inji-web](https://github.com/mosip/inji-web) | Inji Web Wallet |
| [mosip/mimoto](https://github.com/mosip/mimoto) | BFF for Mobile + Web Wallet |
| [mosip/inji-verify](https://github.com/mosip/inji-verify) | Verification module |
| [mosip/digital-credential-plugins](https://github.com/mosip/digital-credential-plugins) | Official plugin implementations |
| [mosip/k8s-infra](https://github.com/mosip/k8s-infra) | Kubernetes infrastructure scripts |
| [mosip/inji-config](https://github.com/mosip/inji-config) | Centralized configuration |

---

## Standards Compliance Summary

| Standard | Inji Support |
|---------|-------------|
| W3C VC Data Model v1.1 | ✅ Full |
| W3C VC Data Model v2.0 | ✅ Full |
| OpenID4VCI Draft 13 | ✅ Full |
| OpenID4VP | ✅ Full |
| SD-JWT (IETF) | ✅ Full (from v0.13.0) |
| ISO/IEC 18013-5 mDoc | ✅ Partial |
| ISO/IEC 18013-5 mDL | ✅ Partial |
| Claim 169 / CBOR-CWT | ✅ Available |
| DID (Decentralised Identifiers) | ✅ Supported |
| OAuth 2.0 / OIDC | ✅ Required for auth |