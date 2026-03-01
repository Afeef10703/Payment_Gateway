function SuccessScreen({ amount, onBack }) {
  return (
    <div className="result-screen result-screen--success">
      <div className="result-screen__icon" aria-hidden="true">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="32" fill="#DCFCE7" />
          <path d="M20 32l8 8 16-16" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h2 className="result-screen__title">Payment Successful</h2>
      <p className="result-screen__message">
        Your payment of <strong>₹{amount?.toLocaleString("en-IN") ?? "14,900"}</strong> was completed successfully.
      </p>
      <button type="button" className="pay-btn result-screen__btn" onClick={onBack}>
        <span className="btn-text">Back to Checkout</span>
      </button>
    </div>
  );
}

export default SuccessScreen;