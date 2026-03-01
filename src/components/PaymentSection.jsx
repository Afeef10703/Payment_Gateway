import lock from "../assets/lock.svg";
import icon1 from "../assets/Icon1.svg";
import icon2 from "../assets/Icon2.svg";
import icon3 from "../assets/Icon3.svg";
import icon4 from "../assets/Icon4.svg";
import icon5 from "../assets/Icon5.svg";

function PaymentSection({
    values,
    errors,
    touched,
    submitted,
    onChange,
    onBlur,
    inputRefs,
}) {
    const showError = (field) => Boolean(errors?.[field] && (touched?.[field] || submitted));

    return (
        <div className="payment-section">
            <div className="payment-header">
                <div className="payment-title"> 
                    Card Payment
                </div>
            
                <div className="payment-icons">
                    <div className="icon-wrapper"> 
                        <img src={icon1} alt="Payment Icon 1" className="payment-icon-img" />
                    </div>
                
                    <div className="icon-wrapper">
                        <img src={icon2} alt="Payment Icon 2" className="payment-icon-img" />
                    </div>
                </div>
            </div>

            <div className="form-field">
                <div className="label-margin">
                    <label htmlFor="cardholder-name" className="form-label">Cardholder Name</label>
                </div>

                <div className="form-input-wrapper">
                    <input
                        id="cardholder-name"
                        name="cardholderName"
                        type="text"
                        placeholder="Enter name on card"
                        className={`form-input ${showError("cardholderName") ? "is-invalid" : ""}`}
                        autoComplete="cc-name"
                        value={values.cardholderName}
                        onChange={onChange}
                        onBlur={onBlur}
                        ref={(el) => {
                            if (inputRefs?.current) inputRefs.current.cardholderName = el;
                        }}
                        aria-invalid={showError("cardholderName")}
                        aria-describedby={showError("cardholderName") ? "cardholder-name-error" : undefined}
                    />
                    {showError("cardholderName") && (
                        <p id="cardholder-name-error" className="field-error" role="alert">
                            {errors.cardholderName}
                        </p>
                    )}
                </div>

            </div>

            <div className="form-field">
                <div className="label-margin">
                    <label htmlFor="card-number" className="form-label">Card Number</label>
                </div>
                
                <div className="card-input-wrapper">
                    <input
                        id="card-number"
                        name="cardNumber"
                        type="text"
                        inputMode="numeric"
                        placeholder="0000 0000 0000 0000"
                        className={`form-input card-input ${showError("cardNumber") ? "is-invalid" : ""}`}
                        autoComplete="cc-number"
                        value={values.cardNumber}
                        onChange={onChange}
                        onBlur={onBlur}
                        ref={(el) => {
                            if (inputRefs?.current) inputRefs.current.cardNumber = el;
                        }}
                        aria-invalid={showError("cardNumber")}
                        aria-describedby={showError("cardNumber") ? "card-number-error" : undefined}
                    />
                    <div className="card-icon-container">
                        <img src={icon3} alt="Card Icon" className="card-icon"/>
                    </div>
                </div>
                {showError("cardNumber") && (
                    <p id="card-number-error" className="field-error" role="alert">
                        {errors.cardNumber}
                    </p>
                )}
            </div>

            <div className="expiry-cvv-row">
                {/* EXPIRY */}
                <div className="expiry-cvv-field">
                    <div className="label-margin">
                        <label htmlFor="expiry-date" className="form-label">Expiry Date</label>
                    </div>
                    
                    <div className="expiry-input-wrapper">
                        <input
                            id="expiry-date"
                            name="expiryDate"
                            type="text"
                            inputMode="numeric"
                            placeholder="MM/YY"
                            className={`form-input small-input ${showError("expiryDate") ? "is-invalid" : ""}`}
                            autoComplete="cc-exp"
                            value={values.expiryDate}
                            onChange={onChange}
                            onBlur={onBlur}
                            ref={(el) => {
                                if (inputRefs?.current) inputRefs.current.expiryDate = el;
                            }}
                            aria-invalid={showError("expiryDate")}
                            aria-describedby={showError("expiryDate") ? "expiry-date-error" : undefined}
                        />
                    </div>
                    {showError("expiryDate") && (
                        <p id="expiry-date-error" className="field-error" role="alert">
                            {errors.expiryDate}
                        </p>
                    )}
                </div>

                {/* CVV */}
                <div className="expiry-cvv-field">
                    <div className="label-margin">
                        <label htmlFor="cvv" className="form-label">CVV</label>
                    </div>
                    
                    <div className="cvv-input-wrapper">
                        <input
                            id="cvv"
                            name="cvv"
                            type="password"
                            inputMode="numeric"
                            placeholder="123"
                            className={`form-input small-input cvv-input ${showError("cvv") ? "is-invalid" : ""}`}
                            autoComplete="cc-csc"
                            value={values.cvv}
                            onChange={onChange}
                            onBlur={onBlur}
                            ref={(el) => {
                                if (inputRefs?.current) inputRefs.current.cvv = el;
                            }}
                            aria-invalid={showError("cvv")}
                            aria-describedby={showError("cvv") ? "cvv-error" : undefined}
                        />
                        <div className="cvv-icon-container">
                            <img src={icon4} alt="CVV Info" className="cvv-icon"/>
                        </div>
                    </div>
                    {showError("cvv") && (
                        <p id="cvv-error" className="field-error" role="alert">
                            {errors.cvv}
                        </p>
                    )}
                </div>
            </div>

            <div className="security-info">
                <div className="security-icon-container">
                    <img src={lock} alt="Secure" className="security-icon"/>
                </div>
                
                <div className="security-text-container">
                    <span className="security-text">YOUR PAYMENT IS SECURED WITH 256-BIT ENCRYPTION</span>
                </div>
            </div>

            <div className="other-methods-link">
                <div className="other-methods-button">
                    <span className="other-methods-text">Other Payment Methods</span>
                    <div className="other-methods-icon">
                        <img src={icon5} alt="Chevron" />
                    </div>
                </div>
                
                <div className="legal-container">
                    <p className="legal-text">
                        By tapping Pay Now, you agree to our Terms of Service and Privacy Policy.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default PaymentSection;