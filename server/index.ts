import express, { Request, Response } from "express";
import cors from "cors";
import Database from "better-sqlite3";

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

const db = new Database("swiss-dairy-orders.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customerName TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    deliveryDate TEXT NOT NULL,
    total REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    createdAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    orderId INTEGER NOT NULL,
    productName TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    FOREIGN KEY (orderId) REFERENCES orders(id)
  );
`);

type OrderItem = {
  name?: string;
  productName?: string;
  quantity: number;
  price: number;
};

app.get("/", (_req: Request, res: Response) => {
  res.send("Swiss Dairy Farm Node.js backend with SQLite database is running");
});

app.get("/api/orders", (_req: Request, res: Response) => {
  const orders = db.prepare("SELECT * FROM orders ORDER BY id DESC").all();

  const ordersWithItems = orders.map((order: any) => {
    const items = db
      .prepare("SELECT productName, quantity, price FROM order_items WHERE orderId = ?")
      .all(order.id);

    return {
      ...order,
      items,
    };
  });

  res.json(ordersWithItems);
});

app.post("/api/orders", (req: Request, res: Response) => {
  const {
    customerName,
    phone,
    address,
    deliveryDate,
    total,
    items = [],
  } = req.body;

  if (!customerName || !phone || !address || !deliveryDate || total === undefined) {
    return res.status(400).json({
      message: "Customer name, phone, address, delivery date, and total are required",
    });
  }

  const createdAt = new Date().toISOString();

  const insertOrder = db.prepare(`
    INSERT INTO orders (
      customerName,
      phone,
      address,
      deliveryDate,
      total,
      status,
      createdAt
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const result = insertOrder.run(
    customerName,
    phone,
    address,
    deliveryDate,
    total,
    "pending",
    createdAt
  );

  const orderId = Number(result.lastInsertRowid);

  const insertItem = db.prepare(`
    INSERT INTO order_items (
      orderId,
      productName,
      quantity,
      price
    )
    VALUES (?, ?, ?, ?)
  `);

  items.forEach((item: OrderItem) => {
    insertItem.run(
      orderId,
      item.productName || item.name || "Unknown product",
      item.quantity,
      item.price
    );
  });

  const savedOrder = db.prepare("SELECT * FROM orders WHERE id = ?").get(orderId);
  const savedItems = db
    .prepare("SELECT productName, quantity, price FROM order_items WHERE orderId = ?")
    .all(orderId);

  res.status(201).json({
    message: "Order saved successfully in SQLite database",
    order: {
      ...savedOrder,
      items: savedItems,
    },
  });
});

app.patch("/api/orders/:id/status", (req: Request, res: Response) => {
  const orderId = Number(req.params.id);
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({
      message: "Status is required",
    });
  }

  const result = db
    .prepare("UPDATE orders SET status = ? WHERE id = ?")
    .run(status, orderId);

  if (result.changes === 0) {
    return res.status(404).json({
      message: "Order not found",
    });
  }

  const updatedOrder = db.prepare("SELECT * FROM orders WHERE id = ?").get(orderId);

  res.json({
    message: "Order status updated in SQLite database",
    order: updatedOrder,
  });
});

app.listen(PORT, () => {
  console.log(`Swiss Dairy Farm backend with SQLite running on http://localhost:${PORT}`);
});
