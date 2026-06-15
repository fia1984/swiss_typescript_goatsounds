import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type OrderStatus = "pending" | "shipped" | "delivered" | "canceled";

export type OrderItem = {
  id: number;
  name: string;
  price: number;
  unit: string;
  quantity: number;
};

export type Order = {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  deliveryDate: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
};

type OrdersState = {
  orders: Order[];
};

const initialState: OrdersState = {
  orders: [],
};

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    addOrder: (
      state,
      action: PayloadAction<Omit<Order, "id" | "status" | "createdAt">>
    ) => {
      const newOrder: Order = {
        ...action.payload,
        id: crypto.randomUUID(),
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      state.orders.unshift(newOrder);
    },

    updateOrderStatus: (
      state,
      action: PayloadAction<{ id: string; status: OrderStatus }>
    ) => {
      const order = state.orders.find((item) => item.id === action.payload.id);

      if (order) {
        order.status = action.payload.status;
      }
    },

    cancelOrder: (state, action: PayloadAction<string>) => {
      const order = state.orders.find((item) => item.id === action.payload);

      if (order) {
        order.status = "canceled";
      }
    },

    clearOrders: (state) => {
      state.orders = [];
    },
  },
});

export const {
  addOrder,
  updateOrderStatus,
  cancelOrder,
  clearOrders,
} = ordersSlice.actions;

export default ordersSlice.reducer;
