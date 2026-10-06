# KHL SupplyHub

KHL SupplyHub is a MongoDB-based supply chain and logistics management project built to model supplier, product, customer, order, and payment workflows for a construction materials business.

## Overview

The system stores transactional and catalog data in MongoDB with validation and indexing rules, and exposes the dataset through a FastAPI service.

## Core database relationships

- Customers to Orders: 1:N
- Orders to Transactions: 1:1
- Orders to Products: many-to-many via `order_details`
- Products to Suppliers: N:1

## Design decisions

### Embedded data

The following are embedded inside the `orders` document because they are read together with the order and are conceptually owned by it:

- `order_details`
- `transaction`

This keeps order reads efficient and avoids unnecessary joins for common workflows.

### Referenced data

The following stay as references because they have independent lifecycles and do not belong to a single order record:

- `customer_id`
- `product_id`
- `supplier_id`

This avoids duplication and supports growth in customer order histories without unbounded document bloat.

Important note: product names are intentionally not copied into line items, because historical order data should remain accurate even if the product catalog changes later. If a report needs product names, the application should use `$lookup` or a server-side join.

## Collection structures

### Customers

```json
{
  "_id": "ObjectId",
  "first_name": "Brian",
  "last_name": "Langat",
  "email": "brian@khl.co.ke",
  "phone_number": "+254700000001",
  "registration_date": "2026-01-10",
  "country": "Kenya"
}
```

### Suppliers

```json
{
  "_id": "ObjectId",
  "supplier_name": "Rift Valley Quarries Ltd",
  "contact_name": "John Kiptoo",
  "phone": "+254711111111",
  "country": "Kenya"
}
```

### Products

```json
{
  "_id": "ObjectId",
  "product_name": "Y12 High Yield Rebar (12m)",
  "category": "Steel & Iron",
  "price": 1850,
  "stock": 1200,
  "supplier_id": "ObjectId"
}
```

### Orders

```json
{
  "_id": "ObjectId",
  "customer_id": "ObjectId",
  "order_date": "2026-09-12T16:45:00Z",
  "total_amount": 90000,
  "o_status": "Pending",
  "order_details": [
    {
      "product_id": "ObjectId",
      "quantity": 20,
      "price_each": 4500
    }
  ],
  "transaction": {
    "transaction_id": "ObjectId",
    "transaction_date": "2026-09-12T16:45:00Z",
    "payment_method": "M-Pesa",
    "amount": 90000
  }
}
```

## Validation

MongoDB validation is enforced with `$jsonSchema` using rules that reject:

- negative stock values
- negative prices
- invalid email formats
- duplicate customer emails
- invalid order statuses
- empty order details
- zero or negative line quantities
- orders without `customer_id`

The project seeds string dates rather than native BSON dates, which matches the schema and the brief’s expected example style.

## SQL vs MongoDB comparison

| Area | SQL | MongoDB |
| --- | --- | --- |
| Schema enforcement | Table schema and constraints | `$jsonSchema` validation |
| Relationships | Normalized tables with joins | Embedded documents and references |
| Read speed | Fast for indexed relational queries | Fast for document read patterns |
| Write speed | Depends on normalization and indexes | Depends on document shape and write patterns |
| Scalability | Vertical / structured scaling | Horizontal scaling and large document workloads |
| Complex queries | Strong relational reporting | Flexible aggregation and `$lookup` |

## Run locally

Install dependencies:

```bash
python -m venv .venv
. .venv\Scripts\activate
pip install -r requirements.txt
```

Start the API:

```bash
uvicorn backend.api.main:app --reload
```

Or with explicit host/port:

```bash
uvicorn backend.api.main:app --host 0.0.0.0 --port 8000 --reload
```

## Run database seed

If using a local MongoDB instance:

```bash
mongosh "mongodb://localhost:27017/khl_supplyhub" seed.js
```

If using Atlas, the URI should be set through `MONGO_URI` or `MONGODB_URI` in a local environment file that is not committed to version control.

## Run tests

```bash
pytest
```

## Benchmark

```bash
mongosh "mongodb://localhost:27017/khl_supplyhub" benchmark.js
```

## Repository hygiene

- `.env` is excluded from version control
- credentials are not exposed in screenshots or documentation
- dependencies are pinned in `requirements.txt`

## Project structure

```text
.
├── backend/
│   └── api/
│       └── main.py
├── docs/
├── sql/
├── tests/
│   └── test_db.py
├── .env.example
├── .gitignore
├── benchmark.js
├── README.md
├── requirements.txt
├── schema.js
├── seed.js
├── validation_tests.js
└── queries.js
```

## Notes

- This project is MongoDB-first.
- The SQL folder is included as a comparison/artifact for the database design discussion, not as the primary database implementation.
- The `transaction` object is embedded because it is 1:1 with the order and typically read at the same time.
- The document model intentionally avoids copying old product names into historical orders.
