// benchmark.js — MongoDB Indexing Benchmark
db = db.getSiblingDB("khl_supplyhub");

console.log("=== EXPLAIN PLAN FOR ORDER STATUS FILTER ===");

// Benchmark execution stats on indexed field o_status
const explainOutput = db.orders.find({ o_status: "Pending" }).explain("executionStats");

console.log("Execution Stage:", explainOutput.executionStats.executionStages.stage);
console.log("Total Docs Examined:", explainOutput.executionStats.totalDocsExamined);
console.log("Total Keys Examined:", explainOutput.executionStats.totalKeysExamined);
console.log("Execution Time (ms):", explainOutput.executionStats.executionTimeMillis);