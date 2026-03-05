import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { getUserAvatar } from '../../utils/userUtils';
import { getSubcategoryById } from '../../utils/constants/examCategories';
import { User, Settings, Target, CreditCard, LogOut, ChevronRight, Shield, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UserProfile = ({ examGoal, onChangeGoal }) => {
    const { currentUser, logout, isAdmin } = useAuth();
    const { theme } = useTheme();
    const { isActive, isFreePlan } = useSubscription();
    const navigate = useNavigate();
    const isDark = theme === 'dark';
    const [avatarError, setAvatarError] = useState(false);

    // Helper for conditional classes
    const mode = (light, dark) => (isDark ? dark : light);

    if (!currentUser) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${mode('bg-slate-50', 'bg-gray-950')}`}>
                <div className="text-center p-8 max-w-sm w-full mx-auto">
                    <p className={mode('text-slate-600', 'text-gray-400')}>Please log in to view your profile.</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    const userAvatar = getUserAvatar(currentUser);
    const currentGoalData = examGoal && examGoal !== '__skipped__' ? getSubcategoryById(examGoal) : null;

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error("Failed to log out:", error);
        }
    };

    return (
        <div className={`min-h-screen py-10 px-4 sm:px-6 lg:px-8 ${mode('bg-slate-50', 'bg-gray-950')}`}>
            <div className="max-w-3xl mx-auto space-y-6">

                {/* Header Section */}
                <div>
                    <h1 className={`text-2xl font-bold tracking-tight ${mode('text-slate-900', 'text-white')}`}>
                        Settings & Profile
                    </h1>
                    <p className={`mt-1 text-sm ${mode('text-slate-500', 'text-gray-400')}`}>
                        Manage your account settings and exam preferences.
                    </p>
                </div>

                {/* Profile Card */}
                <div className={`p-6 rounded-2xl border ${mode('bg-white border-slate-200 shadow-sm', 'bg-gray-900 border-gray-800')}`}>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                        <div className={`w-24 h-24 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden border-4 ${mode('bg-slate-100 border-white shadow-md', 'bg-gray-800 border-gray-800')}`}>
                            {userAvatar && !avatarError ? (
                                <img
                                    src={userAvatar}
                                    alt={currentUser.displayName || 'User'}
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                    onError={() => setAvatarError(true)}
                                />
                            ) : (
                                <User className={`w-10 h-10 ${mode('text-slate-400', 'text-gray-600')}`} />
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <h2 className={`text-xl font-bold truncate ${mode('text-slate-900', 'text-white')}`}>
                                {currentUser.displayName || 'QuizMaster User'}
                            </h2>
                            <div className="mt-1 flex flex-col gap-1.5">
                                <div className={`flex items-center gap-2 text-sm ${mode('text-slate-600', 'text-gray-400')}`}>
                                    <Mail className="w-4 h-4 opacity-70" />
                                    <span className="truncate">{currentUser.email}</span>
                                </div>
                                {isAdmin && (
                                    <div className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400 font-medium">
                                        <Shield className="w-4 h-4" />
                                        <span>Administrator Profile</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Exam Goal Setting */}
                    <div className={`p-6 rounded-2xl border flex flex-col ${mode('bg-white border-slate-200 shadow-sm', 'bg-gray-900 border-gray-800')}`}>
                        <div className="flex items-center gap-3 mb-1">
                            <div className={`p-2 rounded-lg ${mode('bg-blue-50 text-blue-600', 'bg-blue-500/10 text-blue-400')}`}>
                                <Target className="w-5 h-5" />
                            </div>
                            <h3 className={`text-lg font-bold ${mode('text-slate-900', 'text-white')}`}>Exam Goal</h3>
                        </div>
                        <p className={`text-sm mb-5 ${mode('text-slate-500', 'text-gray-400')}`}>
                            Tailor your test series recommendations and dashboard to your target exam.
                        </p>

                        <div className="mt-auto">
                            <div className={`p-4 rounded-xl mb-4 border ${mode('bg-slate-50 border-slate-200', 'bg-gray-800/50 border-gray-700')}`}>
                                {currentGoalData ? (
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{currentGoalData.icon}</span>
                                        <div className="min-w-0">
                                            <p className={`font-semibold truncate ${mode('text-slate-900', 'text-white')}`}>
                                                {currentGoalData.name}
                                            </p>
                                            <p className={`text-xs truncate ${mode('text-slate-500', 'text-gray-400')}`}>
                                                {currentGoalData.parentIcon} {currentGoalData.parentCategory}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <Target className={`w-6 h-6 ${mode('text-slate-400', 'text-gray-500')}`} />
                                        <p className={`font-medium ${mode('text-slate-600', 'text-gray-400')}`}>No goal selected</p>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => onChangeGoal && onChangeGoal()}
                                className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${mode('bg-blue-600 hover:bg-blue-700 text-white shadow-sm', 'bg-blue-600 hover:bg-blue-700 text-white')
                                    }`}
                            >
                                {currentGoalData ? 'Change Exam Goal' : 'Select an Exam Goal'}
                            </button>
                        </div>
                    </div>

                    {/* Subscription Status */}
                    <div className={`p-6 rounded-2xl border flex flex-col ${mode('bg-white border-slate-200 shadow-sm', 'bg-gray-900 border-gray-800')}`}>
                        <div className="flex items-center gap-3 mb-1">
                            <div className={`p-2 rounded-lg ${mode('bg-green-50 text-green-600', 'bg-green-500/10 text-green-400')}`}>
                                <CreditCard className="w-5 h-5" />
                            </div>
                            <h3 className={`text-lg font-bold ${mode('text-slate-900', 'text-white')}`}>Subscription</h3>
                        </div>
                        <p className={`text-sm mb-5 ${mode('text-slate-500', 'text-gray-400')}`}>
                            Manage your premium access to test series and AI generators.
                        </p>

                        <div className="mt-auto">
                            <div className={`p-4 rounded-xl mb-4 border ${isActive && !isFreePlan
                                    ? mode('bg-green-50 border-green-200', 'bg-green-500/10 border-green-800/50')
                                    : mode('bg-slate-50 border-slate-200', 'bg-gray-800/50 border-gray-700')
                                }`}>
                                <div className="flex items-center gap-3">
                                    <div className="min-w-0">
                                        <p className={`font-semibold truncate ${isActive && !isFreePlan
                                                ? mode('text-green-800', 'text-green-400')
                                                : mode('text-slate-900', 'text-white')
                                            }`}>
                                            {isActive && !isFreePlan ? 'Premium Member' : 'Free Basic Plan'}
                                        </p>
                                        <p className={`text-xs truncate ${mode('text-slate-500', 'text-gray-400')}`}>
                                            {isActive && !isFreePlan ? 'Full platform access active' : 'Limited to free tests'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate('/subscriptions')}
                                className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 border ${mode('bg-white hover:bg-slate-50 border-slate-300 text-slate-700 shadow-sm', 'bg-transparent hover:bg-gray-800 border-gray-700 text-slate-300')
                                    }`}
                            >
                                Manage Subscription
                            </button>
                        </div>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="pt-6">
                    <button
                        onClick={handleLogout}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${mode('text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100', 'text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-900/50')
                            }`}
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out of Account
                    </button>
                </div>

            </div>
        </div>
    );
};

export default UserProfile;
