# Data and analytics

> Last verified: 2026-11-20
> Checked on the web 2026-11-20: the dbt v1/v2 generation split from docs.getdbt.com, Airflow 3.4.0 release notes, PyPI versions for dbt-core 1.12.7, Airflow 3.4.0, Dagster 1.13.30, Prefect 3.9.4, DuckDB 2.0.0, Polars 2.1.0, dlt 1.32.0, Meltano 4.4.1, SQLMesh 0.236.4, Great Expectations 1.25.0, Soda 4.31.0, PyIceberg 0.12.0, deltalake 1.6.6, Kedro 1.8.0, sqlglot 30.33.0, datacontract-cli 1.2.11, Apicurio Registry 3.3, npm weekly downloads for the DuckDB Node bindings, Arrow, Cube, Evidence, Observable Framework, and GitHub activity for every repo named below. Not checked: cloud warehouse pricing and feature tiers (Snowflake, BigQuery, Databricks), Fivetran and Airbyte connector coverage, Kafka and Flink versions, Spark tuning.

Scope: batch and micro-batch pipelines, warehouse modelling, contracts and schemas, dashboards, embedded analytics. Analytics on the app database: [database.md](database.md). Events, queues, uploads: [data-services.md](data-services.md). Product analytics instrumentation: [observability.md](observability.md).

## Defaults

| Need | Choice |
|------|--------|
| Transform with SQL, versioned in git | dbt v2 (the Rust engine, now the default install). dbt v1 (Python `dbt-core` 1.12.7) when an adapter has no v2 support yet |
| Transform with state, environments, column-level lineage | SQLMesh 0.236 (pre-1.0, small community). Take dbt unless you need its incremental-by-default model |
| Orchestration, small team | Dagster 1.13 or Prefect 3.9. Assets and typing in Dagster, plain Python flows in Prefect |
| Orchestration, large team, operator ecosystem | Airflow 3.4.0 |
| Extract from SaaS APIs | dlt 1.32 as a library inside your pipeline, or Airbyte as a self-hosted service when non-engineers configure sources |
| Local and single-machine analytics | DuckDB 2.0.0 on Parquet. Under 100 GB this outperforms a warehouse for most jobs |
| Dataframe work in Python | Polars 2.1.0. pandas only in existing code |
| Team dashboard | Metabase or Superset. Metabase is faster to stand up, Superset has more chart types and a governed SQL Lab |
| Embedded analytics in the product | Cube 21.3k stars as the semantic layer, then your own frontend. Do not embed the BI tool |
| BI as code, in the repo | Evidence (Markdown plus SQL) or Observable Framework (JS notebooks, last push 2026-05-15) |
| Table format for a lake | Iceberg (PyIceberg 0.12, pre-1.0) or Delta (`deltalake` 1.6.6). Pick one per lake, never both on the same tables |
| Data quality | dbt tests plus Elementary. Great Expectations 1.25.0 or Soda 4.31.0 for pipelines outside dbt |

## Pipeline shape

Four layers, each a schema or a folder. Landing zone keeps the source bytes as they arrived. Staging types and dedupes into one row per key. Marts are business objects with tests and documented columns. Consumption is BI, exports, or an API.

Rules that make this work:

- Every model is a query over other models. A copy of someone's notebook is not a pipeline.
- Every run is idempotent and partitioned by a date column. Re-running yesterday must produce the same rows, not duplicates.
- Never full refresh in production without a gate. Incremental models key on an immutable timestamp or an id.
- Land raw data before transforming it. A pipeline that re-fetches from the source to fix a bug has already lost the history.
- Keep the warehouse schema in the repo. Migrations, dbt or SQLMesh files, and a seed for small dimensions.
- Test every mart on not-null, unique, relationships, and accepted values. A dashboard on untested data lies quietly.

## Warehouse

| Situation | Use | Note |
|-----------|-----|------|
| Small app, first analytics questions | The app Postgres, with a read replica and a `analytics` schema | Copy, never query the primary in production |
| Event analytics, high write volume | ClickHouse | One binary or managed. Do not put transactional writes on it |
| Files on object storage, up to hundreds of GB | DuckDB over Parquet | `@duckdb/node-api` 4.04M/wk, currently `2.0.0-rc.1`, so pin it. The npm `duckdb` package (307k/wk) is the older binding, use it only in existing code |
| Cloud warehouse already paid for | BigQuery, Snowflake, Databricks | Follow the org, not this file |
| Federated queries across sources | Trino | Use when the data cannot move |

DuckDB in the browser (`@duckdb/duckdb-wasm` 778k/wk) fits a local Explorer, not a production dashboard.

## Ingestion

- `dlt` writes to a destination as a Python destination, with incremental and merge strategies, and normalizes schemas. It is code, so it versions in the repo (6.1k stars).
- Airbyte is the service with connectors and a UI (22.4k stars). Self-hosting it costs real maintenance. Cloud is the usual answer.
- Meltano 4.4.1 (2.7k stars) is maintained but small. Prefer dlt or Airbyte for new work.
- For a handful of internal APIs, a scheduled Python function with retries and a cursor is smaller than any of these. Write it as dlt or plain code before adding a platform.

## Avoid

- A warehouse before the product has its first paying question worth answering. Postgres plus Metabase answers the first year.
- Kafka, Flink, or Spark for volumes a single machine handles. Measure the data size first.
- pandas on data that does not fit in memory. Polars or DuckDB, or stream it.
- Two semantic definitions of the same metric. One model owns "active user", everything else reads it.
- A BI tool with hand-written metrics that live only in that tool.
- A notebook run by hand as a production pipeline.
- Both Iceberg and Delta in one lake, or a table format nobody runs compaction on.

## Contracts and schemas

A pipeline breaks when the producer changes a field and nobody tells the consumer. A contract is how the producer tells.

- Every event and every published table has a contract: the fields, types, nullability, the owner, the retention, and what a breaking change is. Store it in the repo next to the producer.
- Validate the contract at the boundary, in the producer and again on ingest. A schema that only exists in a document drifts in a week.
- Zod, Pydantic, or Avro per ecosystem. The same schema generates the types on both sides, so a rename fails the build rather than the dashboard.
- Events go to a schema registry when several services share a stream: Confluent Schema Registry, Apicurio Registry 3.3, or Buf Schema Registry for Protobuf. Without a shared stream, a checked-in schema file is enough. A registry is infrastructure, not a default.
- Compatibility mode per subject: backward (the default for events), forward when the consumer upgrades first, full when both must work. Deprecate a field by adding the new one, writing both for a release, then removing the old one. Never rename or reuse a field number.
- `datacontract-cli` 1.2 turns the contract into a YAML file the pipeline can assert against. Worth it when the consumer is another team; a typed schema and a review is enough for one team.

Avoid: a schema that lives only in a wiki, a nullable field with no owner, and a registry installed to satisfy a checklist that nobody opens.

## Security and cost

- PII columns get tagged at the source. Mask in the BI tool and restrict at the warehouse, not the other way round.
- Give the BI tool a read-only role on marts only. It should not see raw landing tables.
- Partition pruning is the main cost lever. A query with no date filter on a partitioned table costs the whole table.
- Separate dev and prod targets. A dev run against the prod warehouse is a data incident.
- Budget alerts on the warehouse, and a query log review when the bill moves.
