-- SQL comparison reference for the MongoDB design discussion
-- This file is not the application database; it demonstrates the equivalent relational model.

CREATE TABLE suppliers (
    supplier_id SERIAL PRIMARY KEY,
    supplier_name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255) NOT NULL,
    phone VARCHAR(30),
    country VARCHAR(100)
);

CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    price DECIMAL(12,2) CHECK (price >= 0),
    stock INT CHECK (stock >= 0),
    supplier_id INT NOT NULL REFERENCES suppliers(supplier_id)
);

CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(30),
    registration_date DATE,
    country VARCHAR(100)
);

CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL REFERENCES customers(customer_id),
    order_date TIMESTAMP,
    total_amount DECIMAL(12,2) CHECK (total_amount >= 0),
    o_status VARCHAR(20) CHECK (o_status IN ('Pending', 'Processing', 'Completed', 'Cancelled'))
);

CREATE TABLE order_details (
    order_id INT NOT NULL REFERENCES orders(order_id),
    product_id INT NOT NULL REFERENCES products(product_id),
    quantity INT CHECK (quantity > 0),
    price_each DECIMAL(12,2) CHECK (price_each >= 0),
    PRIMARY KEY (order_id, product_id)
);

CREATE TABLE transactions (
    transaction_id SERIAL PRIMARY KEY,
    order_id INT UNIQUE NOT NULL REFERENCES orders(order_id),
    transaction_date TIMESTAMP,
    payment_method VARCHAR(50),
    amount DECIMAL(12,2) CHECK (amount >= 0)
);
