interface ErrorMessageProps {
  message: string;
}

function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="alert alert-danger mt-3 mb-0" role="alert">
      {message}
    </div>
  );
}

export default ErrorMessage;
