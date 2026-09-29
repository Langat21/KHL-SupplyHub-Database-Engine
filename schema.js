// Switch to KHL SupplyHub Database
db = db.getSiblingDB("khl_supplyhub");

// 1. CUSTOMERS COLLECTION
db.createCollection("customers", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["first_name", "last_name", "email", "phone_number", "registration_date", "country"],
      properties: {
        _id: { bsonType: "objectId" },
        first_name: { bsonType: "string", minLength: 1 },
        last_name: { bsonType: "string", minLength: 1 },
        email: { 
          bsonType: "string", 
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
          description: "Must be a valid email address"
        },
        phone_number: { bsonType: "string" },
        registration_date: { bsonType: "string" },
        country: { bsonType: "string" }
      }
    }
  }
});

db.customers.createIndex({ email: 1 }, { unique: true });
db.customers.createIndex({ country: 1 });

// 2. SUPPLIERS COLLECTION
db.createCollection("suppliers", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["supplier_name", "contact_name", "phone", "country"],
      properties: {
        _id: { bsonType: "objectId" },
        supplier_name: { bsonType: "string" },
        contact_name: { bsonType: "string" },
        phone: { bsonType: "string" },
        country: { bsonType: "string" }
      }
    }
  }
});

// 3. PRODUCTS COLLECTION
db.createCollection("products", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["product_name", "category", "price", "stock", "supplier_id"],
      properties: {
        _id: { bsonType: "objectId" },
        product_name: { bsonType: "string" },
        category: { bsonType: "string" },
        price: { bsonType: ["double", "int", "decimal"], minimum: 0 },
        stock: { bsonType: "int", minimum: 0 },
        supplier_id: { bsonType: "objectId" }
      }
    }
  }
});

db.products.createIndex({ category: 1 });
db.products.createIndex({ supplier_id: 1 });
db.products.createIndex({ stock: 1 });

// 4. ORDERS COLLECTION
db.createCollection("orders", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["customer_id", "order_date", "total_amount", "o_status", "order_details"],
      properties: {
        _id: { bsonType: "objectId" },
        customer_id: { bsonType: "objectId" },
        order_date: { bsonType: "string" },
        total_amount: { bsonType: ["double", "int", "decimal"], minimum: 0 },
        o_status: { 
          enum: ["Pending", "Processing", "Completed", "Cancelled"],
          description: "Status must be restricted to defined operational states"
        },
        order_details: {
          bsonType: "array",
          minItems: 1,
          items: {
            bsonType: "object",
            required: ["product_id", "quantity", "price_each"],
            properties: {
              product_id: { bsonType: "objectId" },
              quantity: { bsonType: "int", minimum: 1 },
              price_each: { bsonType: ["double", "int", "decimal"], minimum: 0 }
            }
          }
        },
        transaction: {
          bsonType: "object",
          required: ["transaction_id", "transaction_date", "payment_method", "amount"],
          properties: {
            transaction_id: { bsonType: "objectId" },
            transaction_date: { bsonType: "string" },
            payment_method: { enum: ["M-Pesa", "Bank Transfer", "Cheque", "Cash"] },
            amount: { bsonType: ["double", "int", "decimal"], minimum: 0 }
          }
        }
      }
    }
  }
});

db.orders.createIndex({ customer_id: 1, order_date: -1 });
db.orders.createIndex({ o_status: 1 });
db.orders.createIndex({ "order_details.product_id": 1 });