export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-100 to-orange-100">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Authentication Error
            </h1>
            <p className="text-gray-600">
              Something went wrong with your login link
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Your login link may have expired or been used already.
            </p>
            
            <a
              href="/login"
              className="inline-block w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition duration-200"
            >
              Try logging in again
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}