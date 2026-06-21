import { describe, expect, test } from "vitest";
import ordersReducer, {
  addOrder,
  cancelOrder,
  updateOrderStatus,
} from "../store/ordersSlice";

describe("ordersSlice unit tests", () => {
  test("adds a new order", () => {
    const order = {
      id: "1",
      orderNumber: "ORD-001",
      customerName: "Fia",
      phone: "1234567890",
      address: "Toronto",
      deliveryDate: "2026-06-20",
      items: [
        {
          id: "1",
          name: "Fresh Swiss Milk",
          price: 6,
          unit: "liter",
          quantity: 2,
        },
      ],
      total: 12,
      status: "pending",
      createdAt: "2026-06-20",
    };

    const state = ordersReducer(undefined, addOrder(order));

    expect(state.orders).toHaveLength(1);
    expect(state.orders[0].customerName).toBe("Fia");
    expect(state.orders[0].status).toBe("pending");
  });

  test("cancels an order", () => {
    const startState = {
      orders: [
        {
          id: "1",
          orderNumber: "ORD-001",
          customerName: "Fia",
          phone: "1234567890",
          address: "Toronto",
          deliveryDate: "2026-06-20",
          items: [],
          total: 12,
          status: "pending",
      createdAt: "2026-06-20",
        },
      ],
      loading: false,
      error: null,
    };

    const state = ordersReducer(startState, cancelOrder("1"));

    expect(state.orders[0].status).toBe("canceled");
  });

  test("No Keep Order should show order kept and not canceled", () => {
    const startState = {
      orders: [
        {
          id: "1",
          orderNumber: "ORD-001",
          customerName: "Fia",
          phone: "1234567890",
          address: "Toronto",
          deliveryDate: "2026-06-20",
          items: [],
          total: 12,
          status: "pending",
      createdAt: "2026-06-20",
        },
      ],
      loading: false,
      error: null,
    };

    const state = ordersReducer(
      startState,
      updateOrderStatus({ id: "1", status: "order kept" })
    );

    expect(state.orders[0].status).toBe("order kept");
    expect(state.orders[0].status).not.toBe("canceled");
  });

  test("marks an order as delivered", () => {
    const startState = {
      orders: [
        {
          id: "1",
          orderNumber: "ORD-001",
          customerName: "Fia",
          phone: "1234567890",
          address: "Toronto",
          deliveryDate: "2026-06-20",
          items: [],
          total: 12,
          status: "pending",
      createdAt: "2026-06-20",
        },
      ],
      loading: false,
      error: null,
    };

    const state = ordersReducer(
      startState,
      updateOrderStatus({ id: "1", status: "delivered" })
    );

    expect(state.orders[0].status).toBe("delivered");
  });
});
