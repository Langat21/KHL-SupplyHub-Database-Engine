// seed.js — Data Seeding for KHL SupplyHub
db = db.getSiblingDB("khl_supplyhub");

// Clean existing data
db.customers.drop();
db.suppliers.drop();
db.products.drop();
db.orders.drop();

console.log("Cleared existing collections.");

// 1. Seed Suppliers
const supplierDocs = [
  { _id: new ObjectId(), supplier_name: "Rift Valley Quarries Ltd", contact_name: "John Kiptoo", phone: "+254711111111", country: "Kenya" },
  { _id: new ObjectId(), supplier_name: "Athi River Steel Works", contact_name: "Grace Wanjiku", phone: "+254722222222", country: "Kenya" },
  { _id: new ObjectId(), supplier_name: "Tororo Cement Co", contact_name: "David Ochieng", phone: "+256733333333", country: "Uganda" },
  { _id: new ObjectId(), supplier_name: "Bamburi Industrial Supply", contact_name: "Amina Hassan", phone: "+254744444444", country: "Kenya" },
  { _id: new ObjectId(), supplier_name: "Kilimanjaro Aggregates", contact_name: "Peter Mwangi", phone: "+255755555555", country: "Tanzania" }
];
db.suppliers.insertMany(supplierDocs);
console.log(`Inserted ${supplierDocs.length} suppliers.`);

// 2. Seed Products
const productDocs = [
  { _id: new ObjectId(), product_name: "Machine Cut Stone 9x9", category: "Masonry", price: 85.00, stock: 15000, supplier_id: supplierDocs[0]._id },
  { _id: new ObjectId(), product_name: "20mm Aggregate Ballast (Ton)", category: "Aggregates", price: 3800.00, stock: 450, supplier_id: supplierDocs[0]._id },
  { _id: new ObjectId(), product_name: "River Sand Clean (Tippers)", category: "Aggregates", price: 4500.00, stock: 40, supplier_id: supplierDocs[4]._id },
  { _id: new ObjectId(), product_name: "Y12 High Yield Rebar (12m)", category: "Steel & Iron", price: 1850.00, stock: 1200, supplier_id: supplierDocs[1]._id },
  { _id: new ObjectId(), product_name: "Y16 High Yield Rebar (12m)", category: "Steel & Iron", price: 2900.00, stock: 850, supplier_id: supplierDocs[1]._id },
  { _id: new ObjectId(), product_name: "Bamburi Nguvu Cement 32.5R (50kg)", category: "Cement", price: 780.00, stock: 2500, supplier_id: supplierDocs[3]._id },
  { _id: new ObjectId(), product_name: "Tororo Power Plus Cement 42.5N", category: "Cement", price: 830.00, stock: 60, supplier_id: supplierDocs[2]._id },
  { _id: new ObjectId(), product_name: "BRC Mesh A142 (6x2.4m)", category: "Steel & Iron", price: 4200.00, stock: 300, supplier_id: supplierDocs[1]._id }
];
db.products.insertMany(productDocs);
console.log(`Inserted ${productDocs.length} products.`);

// 3. Seed Customers
const customerDocs = [
  { _id: new ObjectId(), first_name: "Brian", last_name: "Langat", email: "brian@khl.co.ke", phone_number: "+254700000001", registration_date: "2026-01-10", country: "Kenya" },
  { _id: new ObjectId(), first_name: "Alice", last_name: "Mutua", email: "alice.m@construct.co.ke", phone_number: "+254700000002", registration_date: "2026-02-14", country: "Kenya" },
  { _id: new ObjectId(), first_name: "Charles", last_name: "Kamau", email: "ckamau@buildfit.com", phone_number: "+254700000003", registration_date: "2026-03-01", country: "Kenya" },
  { _id: new ObjectId(), first_name: "Daniel", last_name: "Kiprono", email: "dkip@riftbuilders.com", phone_number: "+254700000004", registration_date: "2026-03-22", country: "Kenya" },
  { _id: new ObjectId(), first_name: "Evelyn", last_name: "Otieno", email: "evelyn@lakeside.co.ke", phone_number: "+254700000005", registration_date: "2026-04-05", country: "Kenya" }
];
db.customers.insertMany(customerDocs);
console.log(`Inserted ${customerDocs.length} customers.`);

// 4. Seed Orders
const orderDocs = [
  {
    _id: new ObjectId(),
    customer_id: customerDocs[0]._id,
    order_date: "2026-08-10T09:30:00Z",
    total_amount: 178000.00,
    o_status: "Completed",
    order_details: [
      { product_id: productDocs[0]._id, quantity: 1000, price_each: 85.00 },
      { product_id: productDocs[1]._id, quantity: 20, price_each: 3800.00 },
      { product_id: productDocs[5]._id, quantity: 20, price_each: 850.00 }
    ],
    transaction: {
      transaction_id: new ObjectId(),
      transaction_date: "2026-08-10T09:35:00Z",
      payment_method: "M-Pesa",
      amount: 178000.00
    }
  },
  {
    _id: new ObjectId(),
    customer_id: customerDocs[1]._id,
    order_date: "2026-08-15T14:10:00Z",
    total_amount: 290000.00,
    o_status: "Completed",
    order_details: [
      { product_id: productDocs[4]._id, quantity: 100, price_each: 2900.00 }
    ],
    transaction: {
      transaction_id: new ObjectId(),
      transaction_date: "2026-08-15T14:12:00Z",
      payment_method: "Bank Transfer",
      amount: 290000.00
    }
  },
  {
    _id: new ObjectId(),
    customer_id: customerDocs[2]._id,
    order_date: "2026-09-01T11:00:00Z",
    total_amount: 49800.00,
    o_status: "Processing",
    order_details: [
      { product_id: productDocs[6]._id, quantity: 60, price_each: 830.00 }
    ],
    transaction: {
      transaction_id: new ObjectId(),
      transaction_date: "2026-09-01T11:05:00Z",
      payment_method: "M-Pesa",
      amount: 49800.00
    }
  },
  {
    _id: new ObjectId(),
    customer_id: customerDocs[0]._id,
    order_date: "2026-09-12T16:45:00Z",
    total_amount: 90000.00,
    o_status: "Pending",
    order_details: [
      { product_id: productDocs[2]._id, quantity: 20, price_each: 4500.00 }
    ]
  },
  {
    _id: new ObjectId(),
    customer_id: customerDocs[3]._id,
    order_date: "2026-09-18T08:20:00Z",
    total_amount: 126000.00,
    o_status: "Completed",
    order_details: [
      { product_id: productDocs[7]._id, quantity: 30, price_each: 4200.00 }
    ],
    transaction: {
      transaction_id: new ObjectId(),
      transaction_date: "2026-09-18T08:22:00Z",
      payment_method: "Cheque",
      amount: 126000.00
    }
  }
];
db.orders.insertMany(orderDocs);
console.log(`Inserted ${orderDocs.length} orders.`);