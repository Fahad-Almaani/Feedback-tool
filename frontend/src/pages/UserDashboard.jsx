import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const UserDashboard = () => {
    const { user, logout } = useAuth();
    const [surveys, setSurveys] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock data for now - replace with actual API call
        const mockSurveys = [
            {
                id: 1,
                title: "Customer Satisfaction Survey",
                description: "Help us improve our services",
                status: "ACTIVE",
                deadline: "2025-08-30"
            },
            {
                id: 2,
                title: "Website Feedback",
                description: "Tell us about your website experience",
                status: "ACTIVE",
                deadline: "2025-09-15"
            }
        ];

        setTimeout(() => {
            setSurveys(mockSurveys);
            setLoading(false);
        }, 1000);
    }, []);

    const handleLogout = () => {
        logout();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">User Dashboard</h1>
                            <p className="text-sm text-gray-600">Welcome back, {user?.name}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-500">Role: {user?.role}</span>
                            <button
                                onClick={handleLogout}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Surveys</h2>

                        {surveys.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500">No surveys available at the moment.</p>
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {surveys.map((survey) => (
                                    <div key={survey.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">{survey.title}</h3>
                                        <p className="text-gray-600 mb-4">{survey.description}</p>
                                        <div className="flex justify-between items-center mb-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${survey.status === 'ACTIVE'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {survey.status}
                                            </span>
                                            <span className="text-sm text-gray-500">Due: {survey.deadline}</span>
                                        </div>
                                        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors">
                                            Take Survey
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* User Profile Section */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                <p className="mt-1 text-sm text-gray-900">{user?.name}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">User ID</label>
                                <p className="mt-1 text-sm text-gray-900">{user?.userId}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Role</label>
                                <p className="mt-1 text-sm text-gray-900">{user?.role}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UserDashboard;