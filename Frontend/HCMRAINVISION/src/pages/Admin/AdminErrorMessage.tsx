/**
 * Shared error display for Admin pages.
 */
interface AdminErrorMessageProps {
  message: string;
}

export default function AdminErrorMessage({ message }: AdminErrorMessageProps) {
  return (
    <div className="p-4 bg-red-50 text-red-700 rounded-lg" role="alert">
      {message}
    </div>
  );
}
