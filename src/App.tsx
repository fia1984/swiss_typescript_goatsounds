import { useMemo, useRef, useState, type FormEvent } from "react";
import SwissLoginImage from "./assets/swiss-login-new.png";
import "./App.css";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { addToCart, increaseQuantity, decreaseQuantity, removeFromCart, clearCart } from "./store/cartSlice";
import { addOrder, updateOrderStatus, cancelOrder } from "./store/ordersSlice";

type UserAccount = {
  username: string;
  password: string;
};

type Product = {
  id: number;
  name: string;
  price: number;
  unit: string;
  image: string;
};

type CartItem = Product & {
  quantity: number;
};

type DeliveryForm = {
  fullName: string;
  phone: string;
  address: string;
  deliveryDate: string;
};

const accounts: UserAccount[] = [
  { username: "fia123", password: "12345" },
  { username: "sammy@gmail.com", password: "sammy456" },
  { username: "gary@gmail.com", password: "gary789" },
  { username: "family@gmail.com", password: "7456" },
];

const products: Product[] = [
  {
    id: 1,
    name: "Fresh Swiss Milk",
    price: 6,
    unit: "liter",
    image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=1000&q=85",
  },
  {
    id: 2,
    name: "Alpine Cream",
    price: 8,
    unit: "jar",
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=1000&q=85",
  },
  {
    id: 3,
    name: "Swiss Farm Butter",
    price: 10,
    unit: "pound",
    image: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=1000&q=85",
  },
  {
    id: 4,
    name: "Morning Milking Bottle",
    price: 5,
    unit: "bottle",
    image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=1000&q=85",
  },
];

const createOrderNumber = () => {
  return `SWISS-${Date.now().toString().slice(-6)}`;
};


function App() {
  const [searchTerm, setSearchTerm] = useState<string>("");

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );
  const dispatch = useAppDispatch();
  const cart = useAppSelector((state) => state.cart.items);
  const orders = useAppSelector((state) => state.orders.orders);
  const deliveryFee = 5;
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [welcome, setWelcome] = useState("");

  
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [formError, setFormError] = useState("");

  const [deliveryForm, setDeliveryForm] = useState<DeliveryForm>({
    fullName: "",
    phone: "",
    address: "",
    deliveryDate: "",
  });
  const [orderNumber, setOrderNumber] = useState<string>("");

  const cowAudioRef = useRef<HTMLAudioElement | null>(null);
  const goatAudioRef = useRef<HTMLAudioElement | null>(null);

  const total = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const playFarmSounds = () => {
    const cowSound = new Audio("/sounds/cow.mp3");
    const goatSound = new Audio("/sounds/goat.mp3");

    cowAudioRef.current = cowSound;
    goatAudioRef.current = goatSound;

    cowSound.volume = 0.45;
    goatSound.volume = 0.4;

    cowSound.play().catch(() => {});
    goatSound.play().catch(() => {});

    setTimeout(() => {
      cowSound.pause();
      goatSound.pause();
      cowSound.currentTime = 0;
      goatSound.currentTime = 0;
    }, 15000);
  };

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const foundUser = accounts.find(
      (account) =>
        account.username.toLowerCase() === username.trim().toLowerCase() &&
        account.password === password.trim()
    );

    if (!foundUser) {
      setLoginError("Invalid username or password.");
      return;
    }

    setLoginError("");
    setIsLoggedIn(true);
    setWelcome(`Welcome ${username}`);
    playFarmSounds();

    setTimeout(() => {
      setWelcome("");
    }, 5000);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername("");
    setPassword("");
    dispatch(clearCart());
    setShowDeliveryForm(false);
    setInvoiceOpen(false);
    setFormError("");
    setDeliveryForm({
      fullName: "",
      phone: "",
      address: "",
      deliveryDate: "",
    });
  };

  

  

  

  const removeItem = (id: number) => {
    dispatch(removeFromCart(id));
  };

  const openDeliveryForm = () => {
    if (cart.length === 0) {
      setFormError("Please add at least one product to the cart first.");
      return;
    }

    setFormError("");
    setShowDeliveryForm(true);
    setInvoiceOpen(false);
  };

  const validateDeliveryForm = () => {
    const nameRegex = /^[A-Za-z ]{3,}$/;
    const phoneRegex = /^[0-9]{10}$/;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selectedDate = new Date(deliveryForm.deliveryDate);

    if (cart.length === 0) {
      return "Cart cannot be empty.";
    }

    if (!nameRegex.test(deliveryForm.fullName.trim())) {
      return "Full name must use letters only and be at least 3 characters.";
    }

    if (!phoneRegex.test(deliveryForm.phone.trim())) {
      return "Phone number must be exactly 10 digits.";
    }

    if (deliveryForm.address.trim().length < 5) {
      return "Delivery address must be at least 5 characters.";
    }

    if (!deliveryForm.deliveryDate) {
      return "Please select a delivery date.";
    }

    if (selectedDate < today) {
      return "Delivery date cannot be in the past.";
    }

    return "";
  };

  const placeOrder = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const error = validateDeliveryForm();

    if (error) {
      setFormError(error);
      return;
    }

    dispatch(
      addOrder({
        customerName: deliveryForm.fullName,
        phone: deliveryForm.phone,
        address: deliveryForm.address,
        deliveryDate: deliveryForm.deliveryDate,
        items: cart.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          unit: item.unit,
          quantity: item.quantity,
        })),
        total:
          cart.reduce((sum, item) => sum + item.price * item.quantity, 0) +
          deliveryFee,
      })
    );

    setFormError("");
    setInvoiceOpen(true);
    setShowDeliveryForm(false);
  };

  if (!isLoggedIn) {
return (
      <main className="login-page">
        <section className="photo-side">
          <img src={SwissLoginImage} alt="Swiss dairy woman with farm animals" />
          <div className="photo-shade">
            <h1>Swiss Dairy Farm</h1>
            <p>Fresh milk, cream, butter, goats, cows, and Alpine farm delivery.</p>
          </div>
        </section>

        <section className="login-side">
          <form className="login-card" onSubmit={handleLogin}>
            <p className="eyebrow">Alpine Farm Portal</p>
            <h2>Welcome Back</h2>
            <p className="login-text">Login to order fresh Swiss dairy products.</p>

            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Enter username"
            />

            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter password"
            />

            {loginError && <p className="error">{loginError}</p>}

            <button type="submit" className="primary-btn">
              Login
            </button>
          </form>
        </section>
      <button
        type="button"
        className="fixed-print-invoice-btn"
        onClick={() => window.print()}
      >
        Print Invoice
      </button>
    </main>
    );
  }

  return (
    <main className="app">
      {welcome && <div className="welcome-banner">{welcome}</div>}

      <header className="topbar">
        <div>
          <p className="eyebrow">Swiss Dairy Farm</p>
          <h1>Fresh Alpine Dairy Products</h1>
          <p>Choose your milk, cream, butter, and fresh farm bottles.</p>
        </div>

        <button type="button" className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <section className="farm-hero">
        <div>
          <h2>From our Swiss farm to your home</h2>
          <p>Professional delivery order system with fresh products and invoice summary.</p>
        </div>
      </section>

      <section className="products-section">
        <h2>Our Products</h2>

        
        <div style={{ margin: "20px 0", display: "flex", justifyContent: "flex-start" }}>
          <input
            type="text"
            placeholder="Search dairy products..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            style={{
              width: "260px",
              padding: "12px 14px",
              borderRadius: "12px",
              border: "1px solid #cfd8d1",
              fontSize: "15px"
            }}
          />
        </div>
        
        {searchTerm.trim() !== "" && filteredProducts.length === 0 && (
          <p className="no-products-found">
            No dairy products found. Try milk, cream, butter, or bottle.
          </p>
        )}
        <div className="product-grid">
          {filteredProducts.map((product) => (
            <article className="product-card" key={product.id}>
              <img src={product.image} alt={product.name} />
              <div className="product-body">
                <h3>{product.name}</h3>
                <p>${product.price} per {product.unit}</p>
                <button type="button" onClick={() => dispatch(addToCart(product))}>
                  Add to Cart
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="cart-section">
        <h2>Your Cart</h2>

        {cart.length === 0 ? (
          <p className="empty-cart">Your cart is empty. Add a product first.</p>
        ) : (
          <div className="cart-list">
            {cart.map((item) => (
              <div className="cart-item" key={item.id}>
                <div>
                  <h3>{item.name}</h3>
                  <p>${item.price} x {item.quantity} = ${item.price * item.quantity}</p>
                </div>

                <div className="cart-actions">
                  <button type="button" onClick={() => dispatch(decreaseQuantity(item.id))}>-</button>
                  <span>{item.quantity}</span>
                  <button type="button" onClick={() => dispatch(increaseQuantity(item.id))}>+</button>
                  <button type="button" className="remove-btn" onClick={() => removeItem(item.id)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}

            <h3 className="total">Total: ${total}</h3>
          </div>
        )}

        {formError && <p className="error">{formError}</p>}

        
            {cart.length > 0 && (
              <button
                type="button"
                className="clear-cart-btn"
                onClick={() => dispatch(clearCart())}
              >
                Clear Cart
              </button>
            )}
{cart.length > 0 && (
              <button type="button" className="primary-btn delivery-btn" onClick={openDeliveryForm}>

    Proceed to Delivery Form

  </button>
            )}
      </section>

      {showDeliveryForm && cart.length > 0 && (
        <section className="delivery-section">
          <h2>Delivery Order Form</h2>

          <form className="delivery-form" onSubmit={placeOrder}>
            <label>Full Name</label>
            <input
              type="text"
              value={deliveryForm.fullName}
              onChange={(event) =>
                setDeliveryForm({ ...deliveryForm, fullName: event.target.value })
              }
              placeholder="Enter full name"
            />

            <label>Phone Number</label>
            <input
              type="text"
              value={deliveryForm.phone}
              onChange={(event) =>
                setDeliveryForm({ ...deliveryForm, phone: event.target.value })
              }
              placeholder="10 digit phone number"
            />

            <label>Delivery Address</label>
            <textarea
              value={deliveryForm.address}
              onChange={(event) =>
                setDeliveryForm({ ...deliveryForm, address: event.target.value })
              }
              placeholder="Enter delivery address"
            />

            <label>Delivery Date</label>
            <input
              type="date"
              value={deliveryForm.deliveryDate}
              onChange={(event) =>
                setDeliveryForm({ ...deliveryForm, deliveryDate: event.target.value })
              }
            />

            {formError && <p className="error">{formError}</p>}

            <button type="submit" className="primary-btn">
              Place Order
            </button>
          </form>
        </section>
      )}

      {invoiceOpen && (
        <section className="invoice-section">
          <h2>Final Invoice</h2>

          <div className="invoice-card">
            <h3>Customer Details</h3>
            <p><strong>Name:</strong> {deliveryForm.fullName}</p>
            <p><strong>Phone:</strong> {deliveryForm.phone}</p>
            <p><strong>Address:</strong> {deliveryForm.address}</p>
            <p><strong>Delivery Date:</strong> {deliveryForm.deliveryDate}</p>

            <h3>Order Details</h3>
            {cart.map((item) => (
              <p key={item.id}>
                {item.name} — {item.quantity} {item.unit}(s) — ${item.price * item.quantity}
              </p>
            ))}

            <h2>Subtotal: ${total}</h2>
            <h2>Delivery Fee: ${deliveryFee}</h2>
            <h1>🇨🇭 Final Total: ${total + deliveryFee}</h1>
            <p className="thank-you">Thank you for ordering from Swiss Dairy Farm.</p>
          </div>
        </section>
      )}

      {orders.length > 0 && (
        <section className="invoice-section">
          <h2>Saved Orders</h2>

          {orders.map((order) => (
            <div className="invoice-card" key={order.id}>
              <h3>{order.customerName}</h3>

              <p><strong>Phone:</strong> {order.phone}</p>
              <p><strong>Delivery Date:</strong> {order.deliveryDate}</p>
              <p><strong>Status:</strong> {order.status}</p>
              <p><strong>Total:</strong> ${order.total}</p>

              <h3>Items</h3>
              {order.items.map((item) => (
                <p key={item.id}>
                  {item.name} — {item.quantity} {item.unit}(s)
                </p>
              ))}

              <button
                type="button"
                className="primary-btn"
                onClick={() =>
                  dispatch(updateOrderStatus({ id: order.id, status: "shipped" }))
                }
              >
                Mark Shipped
              </button>

              <button
                type="button"
                className="primary-btn"
                onClick={() =>
                  dispatch(updateOrderStatus({ id: order.id, status: "delivered" }))
                }
              >
                Mark Delivered
              </button>

              <button
                type="button"
                className="logout-btn"
                onClick={() => dispatch(cancelOrder(order.id))}
              >
                Cancel Order
              </button>
            </div>
          ))}
        </section>
      )}
    </main>
  );
}

export default App;
