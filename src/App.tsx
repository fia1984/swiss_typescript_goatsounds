import { useState, type FormEvent } from "react";
import SwissLoginImage from "./assets/swiss-login-new.png";

type Account = {
  username: string;
  password: string;
};

type Product = {
  id: number;
  name: string;
  price: number;
  unit: string;
  icon: string;
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

const accounts: Account[] = [
  { username: "fia123", password: "12345" },
  { username: "sammy@gmail.com", password: "sammy456" },
  { username: "gary@gmail.com", password: "gary789" },
  { username: "admin@gmail.com", password: "admin123" }
];

const products: Product[] = [
  { id: 1, name: "Fresh Swiss Milk", price: 6, unit: "liter", icon: "🥛" },
  { id: 2, name: "Alpine Cream", price: 8, unit: "jar", icon: "🍶" },
  { id: 3, name: "Swiss Farm Butter", price: 10, unit: "pound", icon: "🧈" },
  { id: 4, name: "Morning Milking Bottle", price: 5, unit: "bottle", icon: "🐄" }
];

const emptyDeliveryForm: DeliveryForm = {
  fullName: "",
  phone: "",
  address: "",
  deliveryDate: ""
};

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loggedInUser, setLoggedInUser] = useState("");
  const [loginError, setLoginError] = useState("");
  const [welcome, setWelcome] = useState("");

  const [cart, setCart] = useState<CartItem[]>([]);
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [deliveryForm, setDeliveryForm] = useState<DeliveryForm>(emptyDeliveryForm);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [invoice, setInvoice] = useState<DeliveryForm | null>(null);

  const playLoginSounds = () => {
    const soundFiles = ["/sounds/goat.mp3", "/sounds/cow.mp3", "/sounds/bell.mp3"];

    soundFiles.forEach((file) => {
      const audio = new Audio(file);
      audio.volume = 0.45;
      audio.play().catch(() => undefined);

      setTimeout(() => {
        audio.pause();
        audio.currentTime = 0;
      }, 15000);
    });
  };

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const matchedAccount = accounts.find(
      (account) =>
        account.username.toLowerCase() === username.trim().toLowerCase() &&
        account.password === password.trim()
    );

    if (!matchedAccount) {
      setLoginError("Invalid username or password.");
      return;
    }

    playLoginSounds();
    setLoggedInUser(matchedAccount.username);
    setLoginError("");
    setWelcome(`Welcome ${matchedAccount.username}`);
    setTimeout(() => setWelcome(""), 5000);
  };

  const addToCart = (product: Product) => {
    setInvoice(null);
    setCart((currentCart) => {
      const existingItem = currentCart.find((item) => item.id === product.id);

      if (existingItem) {
        return currentCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }

      return [...currentCart, { ...product, quantity: 1 }];
    });
  };

  const increaseQuantity = (id: number) => {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQuantity = (id: number) => {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (id: number) => {
    setCart((currentCart) => currentCart.filter((item) => item.id !== id));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const validateDeliveryForm = () => {
    const errors: string[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selectedDate = deliveryForm.deliveryDate
      ? new Date(deliveryForm.deliveryDate + "T00:00:00")
      : null;

    if (cart.length === 0) {
      errors.push("Cart cannot be empty.");
    }

    if (!deliveryForm.fullName.trim()) {
      errors.push("Full name is required.");
    } else if (!/^[A-Za-z ]{2,}$/.test(deliveryForm.fullName.trim())) {
      errors.push("Name must use letters and spaces only.");
    }

    if (!deliveryForm.phone.trim()) {
      errors.push("Phone number is required.");
    } else if (!/^[0-9]{10,15}$/.test(deliveryForm.phone.trim())) {
      errors.push("Phone must be 10 to 15 numbers only.");
    }

    if (!deliveryForm.address.trim()) {
      errors.push("Delivery address is required.");
    } else if (deliveryForm.address.trim().length < 5) {
      errors.push("Address must be at least 5 characters.");
    }

    if (!deliveryForm.deliveryDate) {
      errors.push("Delivery date is required.");
    } else if (selectedDate && selectedDate < today) {
      errors.push("Delivery date cannot be in the past.");
    }

    return errors;
  };

  const handleDeliverySubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const errors = validateDeliveryForm();
    setFormErrors(errors);

    if (errors.length > 0) {
      return;
    }

    setInvoice(deliveryForm);
    setShowDeliveryForm(false);
  };

  const handleLogout = () => {
    setUsername("");
    setPassword("");
    setLoggedInUser("");
    setLoginError("");
    setWelcome("");
    setCart([]);
    setShowDeliveryForm(false);
    setDeliveryForm(emptyDeliveryForm);
    setFormErrors([]);
    setInvoice(null);
  };

  if (!loggedInUser) {
    return (
      <main className="login-page">
        <section className="image-side">
          <img src={SwissLoginImage} alt="Swiss dairy farm with dairywoman, goats, cows and Alps" />
        </section>

        <section className="form-side">
          <form className="login-card" onSubmit={handleLogin}>
            <p className="eyebrow">Swiss Dairy Farm</p>
            <h1>Fresh Alpine Login</h1>
            <p className="login-subtitle">
              Sign in to manage milk, cream, butter, cart and delivery orders.
            </p>

            <label>
              Username
              <input
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Enter username"
              />
            </label>

            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter password"
              />
            </label>

            {loginError && <p className="error-text">{loginError}</p>}

            <button type="submit" className="main-button">
              Login
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="app">
      {welcome && <div className="welcome-banner">{welcome}</div>}

      <header className="topbar">
        <div>
          <p className="eyebrow">Swiss Dairy Farm</p>
          <h1>Alpine Product Dashboard</h1>
          <p>Fresh farm products, cart, delivery form and final invoice.</p>
        </div>

        <button type="button" className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <section className="dashboard-grid">
        <div className="panel">
          <h2>Products</h2>

          <div className="products-grid">
            {products.map((product) => (
              <article key={product.id} className="product-card">
                <div className="product-icon">{product.icon}</div>
                <h3>{product.name}</h3>
                <p>
                  ${product.price} / {product.unit}
                </p>
                <button type="button" onClick={() => addToCart(product)}>
                  Add to Cart
                </button>
              </article>
            ))}
          </div>
        </div>

        <aside className="panel cart-panel">
          <h2>Your Cart</h2>

          {cart.length === 0 ? (
            <p className="muted">No products added yet.</p>
          ) : (
            <>
              {cart.map((item) => (
                <div key={item.id} className="cart-item">
                  <div>
                    <strong>{item.name}</strong>
                    <p>
                      ${item.price} × {item.quantity}
                    </p>
                  </div>

                  <div className="cart-actions">
                    <button type="button" onClick={() => decreaseQuantity(item.id)}>
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button type="button" onClick={() => increaseQuantity(item.id)}>
                      +
                    </button>
                    <button type="button" onClick={() => removeItem(item.id)}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              <div className="total-row">
                <strong>Total</strong>
                <strong>${total}</strong>
              </div>
            </>
          )}

          <button
            type="button"
            className="main-button"
            onClick={() => {
              setShowDeliveryForm(true);
              setInvoice(null);
            }}
          >
            Proceed to Delivery Form
          </button>
        </aside>
      </section>

      {showDeliveryForm && (
        <section className="panel delivery-panel">
          <h2>Delivery Order Form</h2>

          {formErrors.length > 0 && (
            <div className="error-box">
              {formErrors.map((error) => (
                <p key={error}>{error}</p>
              ))}
            </div>
          )}

          <form className="delivery-form" onSubmit={handleDeliverySubmit}>
            <label>
              Full Name
              <input
                type="text"
                value={deliveryForm.fullName}
                onChange={(event) =>
                  setDeliveryForm({ ...deliveryForm, fullName: event.target.value })
                }
                placeholder="Customer full name"
              />
            </label>

            <label>
              Phone
              <input
                type="text"
                value={deliveryForm.phone}
                onChange={(event) =>
                  setDeliveryForm({ ...deliveryForm, phone: event.target.value })
                }
                placeholder="Only numbers"
              />
            </label>

            <label>
              Address
              <input
                type="text"
                value={deliveryForm.address}
                onChange={(event) =>
                  setDeliveryForm({ ...deliveryForm, address: event.target.value })
                }
                placeholder="Delivery address"
              />
            </label>

            <label>
              Delivery Date
              <input
                type="date"
                value={deliveryForm.deliveryDate}
                onChange={(event) =>
                  setDeliveryForm({ ...deliveryForm, deliveryDate: event.target.value })
                }
              />
            </label>

            <button type="submit" className="main-button">
              Place Order
            </button>
          </form>
        </section>
      )}

      {invoice && (
        <section className="panel invoice-panel">
          <h2>Final Invoice</h2>

          <div className="invoice-grid">
            <p>
              <strong>Name:</strong> {invoice.fullName}
            </p>
            <p>
              <strong>Phone:</strong> {invoice.phone}
            </p>
            <p>
              <strong>Address:</strong> {invoice.address}
            </p>
            <p>
              <strong>Delivery Date:</strong> {invoice.deliveryDate}
            </p>
          </div>

          <h3>Order Details</h3>
          {cart.map((item) => (
            <div key={item.id} className="invoice-row">
              <span>
                {item.name} × {item.quantity}
              </span>
              <strong>${item.price * item.quantity}</strong>
            </div>
          ))}

          <div className="total-row invoice-total">
            <strong>Grand Total</strong>
            <strong>${total}</strong>
          </div>
        </section>
      )}
    </main>
  );
}

export default App;
