// queries.js — Complete MongoDB Query & Aggregation Suite
db = db.getSiblingDB("khl_supplyhub");

// -----------------------------------------------------------------------------
// 6.1 BASIC CRUD OPERATIONS
// -----------------------------------------------------------------------------

// C - CREATE: Insert a new product
db.products.insertOne({
  product_name: "HDPE Drainage Pipe 110mm",
  category: "Plumbing",
  price: 3200.00,
  stock: 150,
  supplier_id: ObjectId("64f1a2b3c4d5e6f7a8b9c0d1")
});

// R - READ: Retrieve pending orders
const pendingOrders = db.orders.find({ o_status: "Pending" }).toArray();
console.log("--- Pending Orders ---", pendingOrders);

// U - UPDATE: Adjust product pricing and stock
db.products.updateOne(
  { product_name: "20mm Aggregate Ballast (Ton)" },
  { 
    $set: { price: 4000.00 },
    $inc: { stock: 50 }
  }
);

// D - DELETE: Remove product test item
db.products.deleteOne({ product_name: "HDPE Drainage Pipe 110mm" });

// -----------------------------------------------------------------------------
// 6.2 ADVANCED QUERIES & INVENTORY ANALYTICS
// -----------------------------------------------------------------------------

// Query 1: Low-stock warning report (items below threshold stock of 100 units)
const lowStock = db.products.find(
  { stock: { $lt: 100 } },
  { product_name: 1, category: 1, stock: 1 }
).sort({ stock: 1 }).toArray();
console.log("--- Low Stock Alert (< 100) ---", lowStock);

// Query 2: High-value commercial orders (> KES 100,000)
const highValueOrders = db.orders.find(
  { total_amount: { $gt: 100000.00 } }
).sort({ total_amount: -1 }).toArray();
console.log("--- High Value Orders (> 100k) ---", highValueOrders);

// -----------------------------------------------------------------------------
// 6.3 MANDATORY AGGREGATION PIPELINES
// -----------------------------------------------------------------------------

// Pipeline A: Revenue & Order Counts by Order Status
const revenueByStatus = db.orders.aggregate([
  {
    $group: {
      _id: "$o_status",
      total_revenue: { $sum: "$total_amount" },
      total_orders: { $sum: 1 }
    }
  },
  { $sort: { total_revenue: -1 } }
]).toArray();
console.log("--- Pipeline A: Revenue by Status ---", revenueByStatus);

// Pipeline B: Customer Lifetime Value Analysis
const customerLTV = db.orders.aggregate([
  {
    $group: {
      _id: "$customer_id",
      total_spent: { $sum: "$total_amount" },
      order_count: { $sum: 1 }
    }
  },
  {
    $lookup: {
      from: "customers",
      localField: "_id",
      foreignField: "_id",
      as: "customer_info"
    }
  },
  { $unwind: "$customer_info" },
  {
    $project: {
      _id: 1,
      total_spent: 1,
      order_count: 1,
      customer_name: { $concat: ["$customer_info.first_name", " ", "$customer_info.last_name"] },
      email: "$customer_info.email"
    }
  },
  { $sort: { total_spent: -1 } }
]).toArray();
console.log("--- Pipeline B: Customer LTV ---", customerLTV);

// Pipeline C: Product Sales Volume & Revenue
const productSales = db.orders.aggregate([
  { $unwind: "$order_details" },
  {
    $group: {
      _id: "$order_details.product_id",
      total_quantity_sold: { $sum: "$order_details.quantity" },
      total_gross_revenue: { 
        $sum: { $multiply: ["$order_details.quantity", "$order_details.price_each"] } 
      }
    }
  },
  {
    $lookup: {
      from: "products",
      localField: "_id",
      foreignField: "_id",
      as: "product_info"
    }
  },
  { $unwind: "$product_info" },
  {
    $project: {
      product_name: "$product_info.product_name",
      category: "$product_info.category",
      total_quantity_sold: 1,
      total_gross_revenue: 1
    }
  },
  { $sort: { total_quantity_sold: -1 } }
]).toArray();
console.log("--- Pipeline C: Product Sales Volume ---", productSales);

// Pipeline D: Supplier Product Distribution
const supplierDistribution = db.products.aggregate([
  {
    $lookup: {
      from: "suppliers",
      localField: "supplier_id",
      foreignField: "_id",
      as: "supplier"
    }
  },
  { $unwind: "$supplier" },
  {
    $group: {
      _id: "$supplier.supplier_name",
      products_supplied: { $addToSet: "$product_name" },
      total_products: { $sum: 1 },
      total_inventory_value: { $sum: { $multiply: ["$price", "$stock"] } }
    }
  },
  { $sort: { total_inventory_value: -1 } }
]).toArray();
console.log("--- Pipeline D: Supplier Inventory Value ---", supplierDistribution);