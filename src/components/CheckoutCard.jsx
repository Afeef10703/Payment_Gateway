import PaymentSection from "./PaymentSection";
import SuccessScreen from "./SuccessScreen";
import chevronIcon from "../assets/button.svg";
import { useMemo, useRef, useState } from "react";
import { ORDER_AMOUNT, PAYMENT_API_URL } from "../constants";

function onlyDigits(s) {
  return (s || "").replace(/\D/g, "");
}

function formatCardNumber(input) {
  const digits = onlyDigits(input).slice(0, 19);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(input) {
  const digits = onlyDigits(input).slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function luhnCheck(number) {
  let sum = 0;
  let doubleDigit = false;
  for (let i = number.length - 1; i >= 0; i--) {
    let digit = Number(number[i]);
    if (Number.isNaN(digit)) return false;
    if (doubleDigit) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    doubleDigit = !doubleDigit;
  }
  return sum % 10 === 0;
}

function validate(values) {
  const next = {};

  const name = (values.cardholderName || "").trim();
  if (!name) next.cardholderName = "Cardholder name is required.";
  else if (name.length < 2) next.cardholderName = "Enter a valid name.";

  const cardDigits = onlyDigits(values.cardNumber);
  if (!cardDigits) next.cardNumber = "Card number is required.";
  else if (cardDigits.length < 13 || cardDigits.length > 19) next.cardNumber = "Enter a valid card number.";
  else if (!luhnCheck(cardDigits)) next.cardNumber = "Enter a valid card number.";

  const exp = values.expiryDate || "";
  const expDigits = onlyDigits(exp);
  if (!expDigits) next.expiryDate = "Expiry date is required.";
  else if (!/^\d{2}\/\d{2}$/.test(exp)) next.expiryDate = "Use MM/YY format.";
  else {
    const [mmStr, yyStr] = exp.split("/");
    const mm = Number(mmStr);
    const yy = Number(yyStr);
    if (mm < 1 || mm > 12 || Number.isNaN(yy)) next.expiryDate = "Enter a valid expiry date.";
    else {
      const now = new Date();
      const currentYY = now.getFullYear() % 100;
      const currentMM = now.getMonth() + 1;
      if (yy < currentYY || (yy === currentYY && mm < currentMM)) next.expiryDate = "Card is expired.";
    }
  }

  const cvvDigits = onlyDigits(values.cvv);
  if (!cvvDigits) next.cvv = "CVV is required.";
  else if (cvvDigits.length < 3 || cvvDigits.length > 4) next.cvv = "Enter a valid CVV.";

  return next;
}

function CheckoutCard() {
  const [values, setValues] = useState({
    cardholderName: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });

  const [touched, setTouched] = useState({
    cardholderName: false,
    cardNumber: false,
    expiryDate: false,
    cvv: false,
  });

  const [submitted, setSubmitted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null); // null | 'success' | 'failure'
  const [apiError, setApiError] = useState("");

  const inputRefs = useRef({
    cardholderName: null,
    cardNumber: null,
    expiryDate: null,
    cvv: null,
  });


  const errors = useMemo(() => validate(values), [values]);

  function handleChange(e) {
    const { name, value } = e.target;

    setValues((prev) => {
      if (name === "cardNumber") return { ...prev, cardNumber: formatCardNumber(value) };
      if (name === "expiryDate") return { ...prev, expiryDate: formatExpiry(value) };
      if (name === "cvv") return { ...prev, cvv: onlyDigits(value).slice(0, 4) };
      return { ...prev, [name]: value };
    });
  }

  function handleBlur(e) {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  }

  function focusFirstInvalid(nextErrors) {
    const order = ["cardholderName", "cardNumber", "expiryDate", "cvv"];
    const first = order.find((k) => nextErrors[k]);
    if (!first) return;
    const el = inputRefs.current[first];
    if (el && typeof el.focus === "function") el.focus();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
    setTouched({
      cardholderName: true,
      cardNumber: true,
      expiryDate: true,
      cvv: true,
    });

    const nextErrors = validate(values);
    if (Object.keys(nextErrors).length > 0) {
      focusFirstInvalid(nextErrors);
      return;
    }

    setIsProcessing(true);
    setApiError("");

    try {
      const response = await fetch(PAYMENT_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.cardholderName,
          cardNumber: values.cardNumber.replace(/\s/g, ""),
          expiryDate: values.expiryDate,
          cvv: values.cvv,
          amount: ORDER_AMOUNT,
          currency: "INR",
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message = data?.message || data?.error || "Payment failed. Please try again.";
        setPaymentStatus("failure");
        setApiError(message);
        return;
      }

      // Beeceptor returns { "status": "Awesome!" } – treat as success
      const isSuccess = response.ok && (data?.status != null || data?.success === true);
      if (isSuccess) {
        setPaymentStatus("success");
      } else {
        setPaymentStatus("failure");
        setApiError(data?.message || data?.error || "Payment could not be completed.");
      }
    } catch (error) {
      setPaymentStatus("failure");
      setApiError(error.message || "Network error. Please check your connection and try again.");
    } finally {
      setIsProcessing(false);
    }
  }

  function handleBackFromSuccess() {
    setValues({
      cardholderName: "",
      cardNumber: "",
      expiryDate: "",
      cvv: "",
    });
    setTouched({
      cardholderName: false,
      cardNumber: false,
      expiryDate: false,
      cvv: false,
    });
    setSubmitted(false);
    setPaymentStatus(null);
    setApiError("");
  }

  if (paymentStatus === "success") {
    return (
      <div className="checkout-wrapper">
        <SuccessScreen amount={ORDER_AMOUNT} onBack={handleBackFromSuccess} />
      </div>
    );
  }

  return (
    <form className="checkout-wrapper" onSubmit={handleSubmit} noValidate>
      <div className="checkout-header">
        <button className="icon-btn" type="button">
          <img src={chevronIcon} alt="Back" className="header-icon"/>
        </button>
        
        <h1 className="checkout-title">Secure Checkout</h1>
        
        <div className="header-spacer" />
      </div>

      <div className="checkout-content">
        <div className="item-summary-card">
          <div className="item-summary-inner">
            <div className="item-image-bg">
              <img src="/headphones.jpg" alt="Premium Wireless Headphones" className="item-image"/>
            </div>

            <div className="item-text-container">
              <div className="item-summary-label-container">
                <span className="item-summary-label">ITEM SUMMARY</span>
              </div>

              <div className="item-title-container">
                <h2 className="item-title">Premium Wireless Headphones</h2>
              </div>

              <div className="item-price-container">
                <span className="item-price">₹{ORDER_AMOUNT.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>
        </div>
        
        <PaymentSection
          values={values}
          errors={errors}
          touched={touched}
          submitted={submitted}
          onChange={handleChange}
          onBlur={handleBlur}
          inputRefs={inputRefs}
        />
      </div>

      <div className="sticky-cta">
        {apiError && (
          <div className="api-error-banner" role="alert">
            {apiError}
          </div>
        )}

        <div className="button-shadow">
          <button
            className={`pay-btn ${isProcessing ? "pay-btn--loading" : ""}`}
            type="submit"
            disabled={isProcessing}
            aria-busy={isProcessing}
          >
            <div className="btn-container">
              {isProcessing ? (
                <>
                  <span className="pay-btn__spinner" aria-hidden="true" />
                  <span className="btn-text">Processing…</span>
                </>
              ) : (
                <>
                  <div className="btn-col">
                    <span className="btn-text">Pay Now</span>
                  </div>
                  <div className="overlay-dot" />
                  <div className="btn-col">
                    <span className="btn-text">₹{ORDER_AMOUNT.toLocaleString("en-IN")}</span>
                  </div>
                </>
              )}
            </div>
          </button>
        </div>
      </div>
    </form>
  );
}

export default CheckoutCard;