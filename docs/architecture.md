# Architecture and model rationale

## Document model

The project uses MongoDB documents to match operational access patterns rather than a purely normalized relational representation.

## Embedded vs referenced

### Embedded

- `order_details`
- `transaction`

These are embedded because they are always read with the parent order and do not need independent life cycles.

### Referenced

- `customer_id`
- `product_id`
- `supplier_id`

These are references because the parent documents are independent entities and the relationship is not tightly coupled enough to duplicate the records in every order.

## Why not copy product names?

There are two reasons:

1. Historical data should stay accurate over time.
2. Product names and pricing can change without changing the original order record.

If needed, the application can use `$lookup` to resolve these related fields during read queries.

## Schema enforcement

MongoDB validation is applied with `$jsonSchema`. This enforces:

- email format rules
- non-negative price and stock values
- restricted order status values
- minimum length or required fields
- required nested order line fields

`$jsonSchema` does not enforce cross-document reference consistency, so application-level checks may still be needed for stronger integrity guarantees.
