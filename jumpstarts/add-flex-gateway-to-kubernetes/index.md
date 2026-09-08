---
title: Add Flex Gateway to Kubernetes
summary: Install Anypoint Flex Gateway as an ingress controller on a generic Kubernetes cluster.
id: add-flex-gateway-to-kubernetes
categories: mulesoft,kubernetes
tags: mulesoft
status: Published
authors: MuleSoft
duration: 30
feedback: https://github.com/mulesoft-accelerator/mulesoft-accelerator.github.io/issues
---

# Add Flex Gateway to Kubernetes

## Overview

This Codelab provides supporting documentation for installing Anypoint Flex
Gateway as an ingress controller on a generic Kubernetes cluster (i.e., not
cloud-platform specific).

## Prerequisites

- A running Kubernetes cluster
- `kubectl` configured

```bash
kubectl get nodes
```

## Register Flex Gateway

When adding Flex Gateway to Kubernetes, register it through Anypoint Runtime
Manager. The organization id and registration token are prepopulated for the
selected business group and environment.

![Add a Flex Gateway in Runtime Manager](img/2e65c406471c4839.png)

Register the gateway with Anypoint Platform:

```bash
flexctl registration create \
  --client-id="$CLIENT_ID" \
  --client-secret="$CLIENT_SECRET" \
  --output-directory=./registration
```

## Verify the deployment

```bash
kubectl get pods -n gateway
```

Congratulations — Flex Gateway is running as your ingress controller.
