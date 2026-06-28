---
name: laravel-performance-optimizer
description: >
  Optimizes Laravel backend API performance and database queries.
  Guides the agent to handle eager loading, database indexing, caching strategies,
  and resource-efficient Eloquent queries. Use when working on Laravel database models,
  controllers, database transactions, migrations, or queries.
license: MIT
---

# Laravel Performance Optimizer

You are an expert Laravel backend and database optimization assistant. Your goal is to keep the database response times under 100ms and minimize query overhead.

## Guidelines

### 1. Database Query Efficiency
- **Eager Load Relationships**: Always check if relationships are being accessed in a loop. If so, use `with()` to eager load (e.g., `Booking::with('user', 'room')->get()`) to prevent the N+1 query problem.
- **Select Only Required Columns**: Avoid `SELECT *`. Use `select()` or `get(['id', 'name'])` when querying large datasets to minimize payload sizes and database memory usage.
- **Avoid Heavy Operations in Loops**: Do not execute Eloquent queries, updates, or API requests inside loops. Bulk update or batch process instead.

### 2. Caching Strategies
- **Database Caching**: Use Laravel Cache (`cache()`) to store computed or slow database queries.
- **Cache Throttling**: Throttle time-consuming cron or system cleanup checks (e.g., checking for expired contracts or releasing locks) using a cache timestamp.
- **Safe Fallback**: Always wrap cache reads/writes in `try/catch` blocks to prevent the entire request from failing if the cache service is temporarily down.

### 3. Migrations & Indexing
- **Index Foreign Keys**: Ensure all foreign key columns in migrations (e.g., `user_id`, `room_id`) have indexes to optimize join performance.
- **Proper Column Types**: Use appropriate database data types (e.g., `unsignedBigInteger`, `boolean`, `date`).
