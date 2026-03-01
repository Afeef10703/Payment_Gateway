function InputField({ label, placeholder }) {
  return (
    <div className="input-group">
      <label>{label}</label>
      <input type="text" placeholder={placeholder} />
    </div>
  );
}

export default InputField;