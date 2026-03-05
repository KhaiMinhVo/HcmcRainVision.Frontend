/**
 * NotFound – 404 page for unknown routes or API resource not found
 */
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <h1 className="text-6xl font-bold text-gray-300">404</h1>
      <p className="mt-2 text-lg text-gray-600">Trang không tồn tại.</p>
      <Link
        to="/"
        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Quay lại trang chủ
      </Link>
    </div>
  );
}
