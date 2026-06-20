import express, { Request, Response } from "express";
import cors from "cors";

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

type Order = {
  id: number;
  customerName: string;
  phone: string;
  address: string;
  deliveryDate: string;
  total: number;
  status: string;
};

let orders: Order[] = [];

app.get("/", (_req: Request, res: Response) => {
  res.send("Swiss Dairy Farm Node.js backend is running");
});

app.get("/api/orders", (_req: Request, res: Response) => {
  res.json(orders);
});

app.post("/api/orders", (req: Request, res: Response) => {
  const newOrder: Order = {
    id: Date.now(),
    customerName: req.body.customerName,
    phone: req.body.phone,
    address: req.body.address,
    deliveryDate: req.body.deliveryDate,
    total: req.body.total,
    status: "pending",
  };

  orders.push(newOrder);

  res.status(201).json({
    message: "Order saved successfully",
    order: newOrder,
  });
});

app.patch("/api/orders/:id/status", (req: Request, res: Response) => {
  const orderId = Number(req.params.id);
  const { status } = req.body;

  orders = orders.map((order) =>
    order.id === orderId ? { ...order, status } : order
  );

  res.json({
    message: "Order status updated",
    orders,
  });
});

app.listen(PORT, () => {
  console.log(`Swiss Dairy Farm backend running on http://localhost:${PORT}`);
});
