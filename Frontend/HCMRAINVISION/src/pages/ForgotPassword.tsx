/**
 * Forgot Password – submit email, call POST /api/auth/forgot-password
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, getAuthErrorMessage } from '../contexts/AuthContext';
import { validate } from '../lib/validation';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = validate('forgotPassword', { Email: email.trim() });
    if (!result.valid) {
      setError(result.firstMessage ?? 'Dữ liệu không hợp lệ.');
      return;
    }
    setLoading(true);
    try {
      await forgotPassword(email.trim());
      setSuccess(true);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-lg rounded-xl p-8">
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Quên mật khẩu
          </h1>
          <p className="text-gray-600 text-center text-sm mb-6">
            Nhập email đăng ký, chúng tôi sẽ gửi link đặt lại mật khẩu.
          </p>

          {success ? (
            <div className="p-4 rounded-lg bg-green-50 text-green-800 text-sm text-center">
              Vui lòng kiểm tra email để đặt lại mật khẩu.
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="email@example.com"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Đang gửi...' : 'Gửi link đặt lại mật khẩu'}
                </button>
              </form>
            </>
          )}

          <p className="mt-6 text-center text-sm text-gray-600">
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Quay lại đăng nhập
            </Link>
          </p>
        </div>
        <p className="mt-4 text-center">
          <Link to="/" className="text-sm text-gray-500 hover:text-gray-700">
            ← Quay lại trang chủ
          </Link>
        </p>
      </div>
    </div>
  );
}
