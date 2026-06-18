import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import App from "../App";
import { store } from "../store/store";

function renderApp() {
  render(
    <Provider store={store}>
      <App />
    </Provider>
  );
}

test("shows Swiss Dairy Farm login page", () => {
  renderApp();

  expect(screen.getByText(/Swiss Dairy Farm/i)).toBeInTheDocument();
});

test("shows error for wrong login", async () => {
  const user = userEvent.setup();
  renderApp();

  await user.type(screen.getByPlaceholderText(/username/i), "wronguser");
  await user.type(screen.getByPlaceholderText(/password/i), "wrongpass");
  await user.click(screen.getByRole("button", { name: /login|log in/i }));

  expect(screen.getByText(/invalid/i)).toBeInTheDocument();
});

test("allows valid user to login", async () => {
  const user = userEvent.setup();
  renderApp();

  await user.type(screen.getByPlaceholderText(/username/i), "family@gmail.com");
  await user.type(screen.getByPlaceholderText(/password/i), "7456");
  await user.click(screen.getByRole("button", { name: /login|log in/i }));

  expect(await screen.findByText(/Fresh Swiss Milk/i)).toBeInTheDocument();
});
