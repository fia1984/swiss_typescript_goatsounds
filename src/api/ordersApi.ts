export async function saveOrderToDatabase(order: any) {
  const backendOrder = {
    customerName: order.customerName || order.fullName || "Unknown Customer",
    phone: order.phone || "",
    address: order.address || "",
    deliveryDate: order.deliveryDate || "",
    total: order.total || 0,
    items: order.items || [],
  };

  const response = await fetch("http://localhost:5001/api/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(backendOrder),
  });

  if (!response.ok) {
    throw new Error("Failed to save order to database");
  }

  return response.json();
}
