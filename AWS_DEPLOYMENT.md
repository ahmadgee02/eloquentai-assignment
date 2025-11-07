# Eloquent AI – AWS Production Deployment Guide

This document describes how to deploy the **Next.js + FastAPI + MongoDB** web application on **AWS** application with **JWT authentication** and **Ollama** for LLM inference.


## 🧩 Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | Next.js (React) | SSR web interface |
| Backend | FastAPI (Python) | REST API + JWT Auth |
| LLM | Ollama | Local model server (HTTP) |
| Database | MongoDB Atlas | Managed NoSQL DB |
| Containerization | Docker | Immutable packaging |
| Deployment | AWS ECS Fargate (API) + Amplify (frontend) | Managed compute |
| Networking | AWS VPC + ALB + CloudFront | Secure, scalable perimeter |
| Config & Secrets | SSM Parameter Store + Secrets Manager | Centralized configuration |
| Monitoring | CloudWatch + X-Ray | Logs, metrics, traces |


## High-level Architecture

```
            Route 53
                │
            CloudFront 
                │
    S3 (static Next.js assets)
                │
        Application Load Balancer
        /api → ECS Fargate (FastAPI)
        /web → Amplify (Next.js)
                │
                ├── Secrets Manager / SSM (JWT, keys, configs)
                ├── ElastiCache Redis (optional)
                ├── MongoDB Atlas (PrivateLink or VPC peering)
                └── Ollama Inference (private EC2 or ECS-EC2 w/ GPU)
                    ▲
                    └── Only reachable from FastAPI SG (no public access)
```

Why separate Ollama:
- It isolates inference dependencies and GPU resources.
- You can scale the inference plane independently.
- You keep the HTTP surface private and minimal.

**Note:** We can also use serverless LLM as we don't need self-hosted LLM modal.

## Serverless LLM Options

### Option A — Amazon Bedrock
- Set `BEDROCK_MODEL_ID` in SSM, grant ECS task `bedrock:InvokeModel*`.
-  Create a Bedrock **VPC endpoint** for private calls.
- Replace Ollama client with Bedrock Runtime client in FastAPI.

### Option B — External LLM APIs
- Store `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` in Secrets Manager.
- Outbound egress via NAT; add short timeouts, retries with jitter, and rate limits.

## Environments and Configuration

Use distinct AWS accounts or at least distinct namespaces per env: `dev`, `staging`, `prod`.

**Parameter & Secret layout**
```
/eloquent/{env}/NEXT_PUBLIC_API_URL      
/eloquent/{env}/LOG_LEVEL         
/eloquent/{env}/JWT_PRIVATE_KEY           
/eloquent/{env}/MONGODB_URI           
/eloquent/{env}/PINECONE_API_KEY          
/eloquent/{env}/PINECONE_INDEX_NAME         
/eloquent/{env}/OLLAMA_HOST                 
/eloquent/{env}/OLLAMA_MODEL
```

---

## Security Baseline

- Transport Layer Security (TLS) everywhere
- Zero public IPs for workloads. Place ECS and Ollama nodes in **private subnets**.
- Security Groups: Application Load Balancer → FastAPI. FastAPI → Ollama. Deny everything else.
- Web Application Firewall with managed rules and rate-limits on CloudFront.
- Least-privilege IAM roles for ECS tasks and EC2 instances.
- Secrets in Secrets Manager; configs in SSM. No hard-coded secrets.
- MongoDB Atlas via PrivateLink or VPC peering locked to your VPC CIDRs.

---

## CI/CD

- We can use Terraform or AWS CDK as infrastructer as code to define VPC, ECS, ALB, IAM, SSM, Secrets, CloudFront, Route 53, and Redis. Keep per-environment state and variables.


### Frontend (Next.js)
- Prefer **Amplify Hosting** for SSR/static. It builds from Git and supports previews and instant rollbacks.


### Backend (FastAPI on ECS Fargate)
- GitHub Actions builds and pushes Docker image → ECR.
- ECS update: rolling or blue/green via CodeDeploy.
- Health checks on `/healthz` and readiness checks for DB connectivity.

---

## Monitoring & SLOs

- Logs: CloudWatch Logs (JSON). Include trace/request IDs.
- Tracing: OpenTelemetry exporter → AWS X-Ray.
- Metrics/Alarms: ALB 5xx, P95 latency, CPU/Memory, unhealthy targets.
- SLOs: 99.9% availability; P95 latency 500 ms for non-LLM requests, 2 s for LLM answers.
- Error tracking: Sentry for both frontend and backend.

---