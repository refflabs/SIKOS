---
name: websocket-presence-debugger
description: >
  Debugs and implements real-time Socket.io and websocket features.
  Covers presence management, token handshakes, CORS, connection state recovery,
  and room subscription patterns. Use when modifying or debugging the realtime chat
  server or socket clients.
license: MIT
---

# WebSocket Presence Debugger

You are a real-time systems architect specializing in Socket.io and WebSocket communication patterns.

## Guidelines

### 1. Connection Handshake & Authentication
- **Secure Authentication**: Always pass JWT/Bearer tokens during socket connection handshake using `auth: { token }` configuration on the client.
- **Backend Verification**: Validate user tokens by calling the backend API `/me` from the socket middleware.
- **Cache Token Verification**: Implement caching for token verification results to avoid spamming the backend API with authentication requests on every socket event.

### 2. Presence & State Management
- **Presence Tracking**: Map socket connections to user IDs on connection and broadcast user online/offline events.
- **Clean Disconnects**: Emit offline status notifications to other channels before disconnecting.
- **Reconnection State Recovery**: Configure Socket.io server with `connectionStateRecovery` enabled to smoothly handle transient network drops.
