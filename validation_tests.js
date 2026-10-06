// validation_tests.js: boundary tests for KHL SupplyHub MongoDB validators
// Run from the repo root with a connection string to the target database.
// Example:
// mongosh "mongodb://localhost:27017/khl_supplyhub" validation_tests.js

const D = new Date();
const oid = () => new ObjectId();
const created = [];
let pass = 0, fail = 0;

function product(over = {}) {
  return Object.assign({
    _id: oid(),
    product_name: 'TEST Product',
    category: 'Test',
    price: 100,
    stock: 10,
    supplier_id: oid()
  }, over);
}

function customer(over = {}) {
  return Object.assign({
    _id: oid(),
    first_name: 'Test',
    last_name: 'User',
    email: `test.${Date.now()}.${Math.floor(Math.random() * 1e6)}@example.com`,
    phone_number: '+254700000000',
    registration_date: '2026-01-01',
    country: 'Kenya'
  }, over);
}

function order(over = {}) {
  return Object.assign({
    _id: oid(),
    customer_id: oid(),
    order_date: '2026-01-01',
    total_amount: 200,
    o_status: 'Pending',
    order_details: [{ product_id: oid(), quantity: 2, price_each: 100 }]
  }, over);
}

function expectReject(id, label, coll, doc) {
  try {
    db[coll].insertOne(doc);
    created.push([coll, doc._id]);
    print(`${id}  FAIL  ${label}  -> was ACCEPTED (expected rejection)`);
    fail++;
  } catch (e) {
    print(`${id}  PASS  ${label}  -> rejected (error code ${e.code})`);
    pass++;
  }
}

function expectAccept(id, label, coll, doc) {
  try {
    db[coll].insertOne(doc);
    created.push([coll, doc._id]);
    print(`${id}  PASS  ${label}  -> accepted`);
    pass++;
  } catch (e) {
    print(`${id}  FAIL  ${label}  -> rejected (code ${e.code}): ${e.message.split('\n')[0]}`);
    fail++;
  }
}

print('--- KHL SupplyHub validation tests (database: ' + db.getName() + ') ---');

expectReject('V-01', 'product with stock = -1', 'products', product({ stock: -1 }));
expectReject('V-02', 'product with price = -50', 'products', product({ price: -50 }));
expectReject('V-03', 'customer with email "not-an-email"', 'customers', customer({ email: 'not-an-email' }));

const first = customer();
db.customers.insertOne(first); created.push(['customers', first._id]);
expectReject('V-04', 'customer with an existing email', 'customers', customer({ email: first.email }));

expectReject('V-05', 'order with o_status "Shipped"', 'orders', order({ o_status: 'Shipped' }));
expectReject('V-06', 'order with empty order_details', 'orders', order({ order_details: [] }));
expectReject('V-07', 'order line with quantity = 0', 'orders', order({ order_details: [{ product_id: oid(), quantity: 0, price_each: 100 }] }));

const noCustomer = order(); delete noCustomer.customer_id;
expectReject('V-08', 'order without customer_id', 'orders', noCustomer);

expectAccept('V-09', 'Pending order without transaction', 'orders', order());
expectAccept('V-10', 'fully valid product', 'products', product());

created.forEach(([coll, id]) => db[coll].deleteOne({ _id: id }));
print(`--- ${pass} passed, ${fail} failed; test documents removed ---`);
