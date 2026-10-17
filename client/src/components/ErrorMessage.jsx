// ErrorMessage.jsx — Displays error messages from failed API calls

function ErrorMessage({ message }) {
  if (!message) return null;
  return (
    <div className="error-message">
      <span className="error-icon">⚠️</span>
      <span>{message}</span>
    </div>
  );
}

export default ErrorMessage;
