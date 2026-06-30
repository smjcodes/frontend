type ErrorMessageProps = {
  message?: string | null;
};

export default function ErrorMessage({ message }: ErrorMessageProps) {
  if (!message) {
    return null;
  }

  return <div className="alert alert-error">{message}</div>;
}
