import React from 'react';

const NotFound = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full text-center">
                <div className="mb-8">
                    <h1 className="text-9xl font-bold text-gray-300">404</h1>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h2>
                    <p className="text-gray-600 mb-8">
                        The page you're looking for doesn't exist or has been moved.
                    </p>
                </div>

                <div className="space-y-4">
                    <a
                        href="/"
                        className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                    >
                        Go Home
                    </a>
                    <div>
                        <a
                            href="/login"
                            className="text-indigo-600 hover:text-indigo-500 font-medium"
                        >
                            Go to Login
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotFound;