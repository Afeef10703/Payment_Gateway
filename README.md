# Payment Gateway

A responsive, client-side payment checkout flow with card entry, client-side validation, and integration with a mock payment API. Built with React and Vite.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Data Flow & State](#data-flow--state)
- [Features](#features)
- [Testing & Mock API](#testing--mock-api)
- [Getting Started](#getting-started)

---

## Tech Stack

| Layer        | Technology                          |
| ------------ | ----------------------------------- |
| Framework    | React 19                             |
| Build tool   | Vite 7                               |
| Styling      | Plain CSS (global + checkout CSS)   |
| Font         | Inter (Google Fonts)                 |
| API          | Mock endpoint (Beeceptor)            |

No router or global state library: the app is a single-page checkout with local component state.

---

## Architecture

### High-Level Overview

The app is a **single-page checkout**. The UI is split into:

1. **Checkout flow** – Item summary, card form, and Pay button.
2. **Success screen** – Shown after a successful payment; “Back to Checkout” returns to a **cleared** form to avoid duplicate submissions.
3. **Failure handling** – API errors are shown above the Pay button; form values are **kept** so the user can correct and retry.

All state lives in **CheckoutCard**; **PaymentSection** and **SuccessScreen** are presentational and receive props/callbacks.

### Entry Point & Component Hierarchy

```
index.html
  └── #root
        └── main.jsx (ReactDOM.createRoot, React.StrictMode)
              └── App.jsx
                    └── <div className="app-container">
                          └── CheckoutCard
                                ├── [Checkout form]  ← default view
                                │     ├── checkout-header
                                │     ├── checkout-content
                                │     │     ├── item-summary-card
                                │     │     └── PaymentSection (form fields)
                                │     └── sticky-cta (Pay button + apiError banner)
                                │
                                └── SuccessScreen   ← when paymentStatus === 'success'
                                      └── “Back to Checkout” → clears form, resets view
```

- **App** – Wraps the app in a centering container and imports checkout styles.
- **CheckoutCard** – Root of the feature: holds form state, validation, API call, and payment status; conditionally renders either the checkout form or **SuccessScreen**.
- **PaymentSection** – Renders the “Card Payment” block: cardholder name, card number, expiry, CVV, security text, other payment methods link, and legal text. Fully controlled via `values`, `errors`, `touched`, `onChange`, `onBlur`, and `inputRefs`.
- **SuccessScreen** – Displays success icon, message, amount, and “Back to Checkout”; receives `amount` and `onBack`.

### State Management

All state is **local React state** inside `CheckoutCard`:

| State           | Type   | Purpose |
| --------------- | ------ | ------- |
| `values`        | object | Current field values: `cardholderName`, `cardNumber`, `expiryDate`, `cvv`. |
| `touched`       | object | Per-field touch flags; used to show inline errors only after blur or submit. |
| `submitted`     | bool   | True after first submit attempt; ensures all field errors can show. |
| `isProcessing`  | bool   | True while the payment API request is in flight; disables button and shows “Processing…”. |
| `paymentStatus` | `null` \| `'success'` \| `'failure'` | Drives success screen vs form and failure banner. |
| `apiError`      | string | Error message from API (or network); shown in a banner above the Pay button. |

Refs:

- **inputRefs** – References to the four inputs; used to focus the first invalid field on submit.
- No form snapshot is stored on success; “Back to Checkout” explicitly clears the form to avoid duplicate payments.

### Validation & Formatting

- **Validation** is implemented in a single `validate(values)` function in `CheckoutCard.jsx`:
  - **Cardholder name**: required, min length 2.
  - **Card number**: required, 13–19 digits, **Luhn** check.
  - **Expiry**: required, `MM/YY`, 01–12, not in the past.
  - **CVV**: required, 3 or 4 digits.
- Errors are computed with `useMemo(() => validate(values), [values])` and passed to **PaymentSection**.
- **Inline errors** are shown only when `(touched[field] || submitted) && errors[field]`; inputs get `aria-invalid` and `aria-describedby` for the error message.
- **Formatting** (in `CheckoutCard`):
  - Card number: digits only, grouped in 4s (e.g. `4242 4242 4242 4242`).
  - Expiry: digits only, `MM/YY` (e.g. `12/28`).
  - CVV: digits only, max 4.
- On submit, if there are validation errors, the first invalid field is focused via `inputRefs`.

### API Integration

- **Endpoint**: Configured in `src/constants.js` as `PAYMENT_API_URL` (e.g. Beeceptor mock).
- **Trigger**: Form submit; validation runs first; if valid, a single `POST` is sent.
- **Request**: JSON body with `name`, `cardNumber`, `expiryDate`, `cvv`, `amount`, `currency`.
- **Success**: Response `ok` and body indicates success (e.g. `status` or `success`) → `setPaymentStatus('success')` → **SuccessScreen** is shown.
- **Failure**: Non-ok status or missing success flag → `setPaymentStatus('failure')`, `setApiError(message)`. Message is taken from response body `error`/`message` or a fallback. Form values are **not** cleared.
- **Network error**: Caught in `catch`; `apiError` set to a generic message; form values kept.
- **Button**: Disabled and shows a loading spinner while `isProcessing` is true; `aria-busy` is set for accessibility.

### Styling

- **global.css** – Reset, `box-sizing`, `#root`/`body` layout, `.app-container` (centering, responsive padding), base font.
- **checkout.css** – All checkout UI: CSS variables (e.g. `--checkout-max-width`, `--checkout-padding-x`, `--input-height`, `--safe-area-bottom`), layout for wrapper, header, content, form fields, item summary, security block, legal text, sticky CTA, button loading state, API error banner, and success screen.
- **Responsive**: Mobile-first; breakpoints at 360px, 480px, 768px. Wrapper uses `max-width`; padding and typography use `clamp()`/variables where appropriate. Safe-area insets and `100dvh` are used for mobile.

### Accessibility & Forms

- Each input has a unique `id` and matching `label` with `htmlFor`.
- Inputs have `name` and appropriate `autoComplete` (`cc-name`, `cc-number`, `cc-exp`, `cc-csc`).
- Invalid fields use `aria-invalid` and `aria-describedby` pointing to the error message; errors use `role="alert"`.
- Submit button uses `aria-busy` when processing.

---

## Project Structure

```
Payment_Gateway/
├── index.html
├── package.json
├── README.md
├── src/
│   ├── main.jsx              # React root, global CSS import
│   ├── App.jsx               # App shell, CheckoutCard, checkout CSS
│   ├── constants.js          # PAYMENT_API_URL, ORDER_AMOUNT
│   ├── components/
│   │   ├── CheckoutCard.jsx  # Form state, validation, API, success/failure UI
│   │   ├── PaymentSection.jsx # Card form fields (controlled)
│   │   ├── SuccessScreen.jsx  # Success message + Back to Checkout
│   │   └── InputField.jsx    # (if used elsewhere)
│   ├── styles/
│   │   ├── global.css
│   │   └── checkout.css
│   └── assets/               # SVGs (lock, icons, button)
└── ...
```

---

## Features

- **Responsive layout**: Single column; usable on small phones and desktop.
- **Card form**: Cardholder name, number (with Luhn), expiry (MM/YY), CVV; live formatting and validation.
- **Inline errors**: Shown after blur or after first submit; first invalid field focused on submit.
- **Pay button**: Disabled while the API request is in progress; loading state with spinner.
- **Success**: Redirect to **SuccessScreen**; “Back to Checkout” clears the form and returns to the checkout view.
- **Failure**: Error message above the button; form data retained for correction and retry.
- **Currency**: Item summary and success screen show amount with rupee symbol and Indian number formatting (e.g. ₹14,900).

---

## Testing & Mock API

The payment API is replaced in development by a **mock** so we can test success and failure without a real backend.

### Mock service

We use **Beeceptor** (e.g. `https://payment-gateway.free.beeceptor.com`) as the mock. The app sends a `POST` with a JSON body; Beeceptor can be configured with **Mock Rules** to return different HTTP status codes and bodies based on the request.

### Mock rules used

Two representative rules were used to simulate **declined** and **forbidden** scenarios.

---

#### 1. Card declined (HTTP 400)

Used to simulate the bank declining the card.

| Setting            | Value |
| ------------------ | ----- |
| **When (request)** | Method: `POST` |
|                    | Request condition: **Request body contains** |
|                    | Match value: `Decline` |
| **Then (response)** | Response type: Single response |
|                    | Response delayed by: 0 sec |
|                    | Return HTTP status: `400` |
|                    | Response body: `{"error": "Your card was declined by the bank."}` |

**How to test**: Include the string `"Decline"` in the request body (e.g. in cardholder name or in a custom field used only for testing). The mock will return 400 and the app will show the error message above the Pay button and keep the form values.

---

#### 2. Transaction declined – age (HTTP 403)

Used to simulate a business-rule failure (e.g. “too young to purchase”).

| Setting            | Value |
| ------------------ | ----- |
| **When (request)** | Method: `POST` |
|                    | Condition 1: **Request body contains** → `Young` |
|                    | Operator: **AND** |
|                    | Condition 2: **Request path exactly matches** → `/` |
| **Then (response)** | Response type: Single response |
|                    | Response delayed by: 0 sec |
|                    | Return HTTP status: `403` |
|                    | Content-Type: `application/json; charset=utf-8` |
|                    | Response body: `{"error": "Transaction declined: You are too young to make this purchase."}` |

**How to test**: Include the string `"Young"` in the request body and hit the root path. The mock returns 403 and the app displays the error in the same way as the 400 case.

---

### Default (success) behavior

If no mock rule matches, Beeceptor can be set to return a **default** response, e.g.:

- HTTP **200**
- Body: `{"status": "Awesome!"}` (or any JSON with a success indicator)

The app treats a successful HTTP status and a body with `status` or `success` as success and switches to **SuccessScreen**.

### Summary

| Scenario        | How to trigger (mock)     | App behavior |
| --------------- | ------------------------- | ------------ |
| Success         | No rule match / default 200 + body | Show SuccessScreen; “Back to Checkout” clears form. |
| Card declined   | Request body contains `Decline`     | 400 + error JSON → show `apiError`, keep form. |
| Age declined    | Request body contains `Young` + path `/` | 403 + error JSON → show `apiError`, keep form. |
| Network error   | Offline or invalid URL    | Catch block → show generic error, keep form. |

---

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn

### Install and run

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (e.g. `http://localhost:5173`).

### Scripts

| Command          | Description              |
| ---------------- | ------------------------ |
| `npm run dev`    | Start Vite dev server    |
| `npm run build`   | Production build         |
| `npm run preview` | Preview production build |
| `npm run lint`    | Run ESLint               |

### Configuration

- **API endpoint**: Edit `src/constants.js` and set `PAYMENT_API_URL` to your mock or real API base URL.
- **Order amount**: Same file; `ORDER_AMOUNT` is used in the item summary, Pay button label, and API payload.