import { Link } from 'react-router-dom'

function CheckEmail() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-sm w-full max-w-md text-center">
        <div className="text-5xl mb-4">📧</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Check your email</h1>
        <p className="text-gray-500 text-sm mb-6">
          We sent a confirmation link to your email address. Please click it to activate your account before logging in.
        </p>
        <p className="text-xs text-gray-400 mb-6">
          Didn't receive it? Check your spam folder.
        </p>
        <Link
          to="/login"
          className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition cursor-pointer"
        >
          Go to Login
        </Link>
      </div>
    </div>
  )
}

export default CheckEmail