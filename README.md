# TP_Infrastructure_AWS – AWS Infrastructure (CDK TypeScript)

An AWS Infrastructure project using **AWS CDK (Cloud Development Kit)** in **TypeScript** to deploy a full serverless stack with lambdas, Cognito roles, DynamoDB tables, and an S3 bucket for image management. This project illustrates how to provision and manage cloud resources as code.

---

## Project Structure

```

TP_Infrastructure_AWS/
├─ bin/                     # CDK entrypoint
├─ lib/                     # AWS CDK stacks (infrastructure logic)
├─ lambdas/                 # Lambda function sources
├─ test/                    # Unit tests (Jest)
├─ cdk.out/                 # CDK synthesized artifacts
├─ package.json             # Node project and CDK dependencies
├─ tsconfig.json            # TypeScript config
├─ jest.config.js           # Test config
├─ cdk.json                 # CDK CLI config
├─ node_modules/            # Installed modules
└─ README.md

````

---

## Purpose

This project defines and deploys an AWS infrastructure stack using **AWS CDK** in **TypeScript**. It manages:

- **User authentication & roles** via Cognito  
- **Serverless compute** with multiple AWS Lambda functions  
- **Data storage** with DynamoDB tables  
- **Asset storage** using an S3 bucket for images  

The architecture enables event handling, data operations, and authenticated access — all provisioned as infrastructure‑as‑code.

---

## Prerequisites

- Node.js (16+ recommended)
- AWS CLI configured (`aws configure`)
- AWS CDK installed globally:
  ```bash
  npm install -g aws-cdk
````

---

## Local Deployment

### 1. Clone the Repository

```bash
git clone https://github.com/EmmaDjeufa/TP_Infrastructure_AWS.git
cd TP_Infrastructure_AWS
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Compile TypeScript

```bash
npm run build
```

### 4. Deploy the CDK Stack

```bash
npx cdk deploy
```

This deploys the configured AWS resources to your default AWS account and region.

### 5. Inspect or Diff Infrastructure

Compare deployed vs local changes:

```bash
npx cdk diff
```

### 6. Remove the Stack

When finished:

```bash
npx cdk destroy
```

---

## Useful Commands

* `npm run watch` – automatic TS compilation
* `npm run test` – run unit tests with Jest
* `cdk synth` – generate CloudFormation templates

---

## Features

* **Infrastructure as Code** with AWS CDK TypeScript
* **Serverless architecture** with AWS Lambda functions
* **User authentication** via AWS Cognito roles
* **Data persistence** with DynamoDB tables
* **Image storage** using S3 bucket

---

## Feedback & Contributions

* **Issues:** Open a GitHub issue for bugs or suggestions
* **Contributions:** Fork and submit pull requests
* **Contact:** Reach out via GitHub for questions or collaboration

