import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { getAllSubcategories } from '../../utils/constants/examCategories';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Search, X, Loader2, ChevronDown, Monitor } from 'lucide-react';

const GOAL_STORAGE_KEY = 'quizmaster-exam-goal';

// Extracted API functions for better separation of concerns
export const saveExamGoal = async (goalId, currentUser) => {
    localStorage.setItem(GOAL_STORAGE_KEY, goalId);
    if (!currentUser) return;

    try {
        await setDoc(doc(db, 'users', currentUser.uid), {
            examGoal: goalId,
            updatedAt: new Date().toISOString()
        }, { merge: true });
    } catch (err) {
        console.error('Failed to save goal to Firestore:', err);
        throw new Error('Failed to save your goal. Please try again.');
    }
};

export const loadExamGoal = async (currentUser) => {
    const local = localStorage.getItem(GOAL_STORAGE_KEY);
    if (local) return local;

    if (currentUser) {
        try {
            const snap = await getDoc(doc(db, 'users', currentUser.uid));
            if (snap.exists() && snap.data().examGoal) {
                const goal = snap.data().examGoal;
                localStorage.setItem(GOAL_STORAGE_KEY, goal);
                return goal;
            }
        } catch (err) {
            console.error('Failed to load goal from Firestore:', err);
        }
    }
    return null;
};

export const clearExamGoal = async (currentUser) => {
    localStorage.removeItem(GOAL_STORAGE_KEY);
    if (currentUser) {
        try {
            await setDoc(doc(db, 'users', currentUser.uid), { examGoal: null }, { merge: true });
        } catch (err) {
            console.error('Failed to clear goal in Firestore:', err);
        }
    }
};

const ExamGoalSelector = ({ onGoalSelected, onSkip, isModal = false }) => {
    const { theme } = useTheme();
    const { currentUser } = useAuth();
    const isDark = theme === 'dark';

    const [searchQuery, setSearchQuery] = useState('');
    const [savingId, setSavingId] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const inputRef = useRef(null);

    // Helper to toggle tailwind classes cleanly
    const mode = (light, dark) => (isDark ? dark : light);

    const allExams = useMemo(() => {
        const fullList = getAllSubcategories();
        const gate = fullList.find(e => e.id === 'gate');
        const options = [
            { id: '__skipped__', name: 'All Exams', icon: '🌍', parentCategory: 'General' }
        ];
        if (gate) options.push(gate);
        return options;
    }, []);

    const filteredExams = useMemo(() => {
        if (!searchQuery.trim()) return allExams;
        const query = searchQuery.toLowerCase().trim();
        return allExams.filter(exam =>
            exam.name.toLowerCase().includes(query) ||
            exam.parentCategory?.toLowerCase().includes(query)
        );
    }, [allExams, searchQuery]);

    const handleExamSelect = async (exam) => {
        if (savingId) return; // Prevent double clicks

        setSavingId(exam.id);

        try {
            await saveExamGoal(exam.id, currentUser);
        } catch (err) {
            console.error(err);
        } finally {
            setSavingId(null);
            onGoalSelected(exam.id);
        }
    };

    // Auto-focus input when opening dropdown
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const content = (
        <div className={`relative w-full max-w-[420px] mx-auto ${mode('bg-white', 'bg-gray-900')} rounded-2xl shadow-xl border ${mode('border-slate-200', 'border-gray-800')} overflow-visible animate-in fade-in zoom-in-95 duration-200`}>
            {/* Search Content wrapper */}
            <div className="p-3">
                {/* Search Bar / Dropdown Trigger */}
                <div
                    className={`relative flex items-center w-full rounded-xl border-2 transition-all ${isOpen
                        ? mode('border-blue-500 ring-4 ring-blue-500/20 bg-white', 'border-blue-500 ring-4 ring-blue-500/20 bg-gray-900')
                        : mode('border-slate-200 bg-slate-50 hover:border-slate-300', 'border-gray-700 bg-gray-800/50 hover:border-gray-600')
                        }`}
                >
                    <Search className={`absolute left-3.5 w-4 h-4 ${isOpen ? 'text-blue-500' : mode('text-slate-400', 'text-gray-500')}`} />
                    <input
                        ref={inputRef}
                        type="text"
                        className="w-full pl-10 pr-10 py-3 bg-transparent text-sm font-medium outline-none placeholder:font-normal placeholder:opacity-70"
                        placeholder="Search exam (e.g. JEE, GATE)"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            if (!isOpen) setIsOpen(true);
                        }}
                        onClick={() => setIsOpen(true)}
                    />
                    <button
                        className={`absolute right-3 w-6 h-6 flex items-center justify-center rounded-md transition-all ${isOpen ? 'rotate-180 text-blue-500 bg-blue-50 dark:bg-blue-500/10' : mode('text-slate-400 hover:bg-slate-200', 'text-gray-500 hover:bg-gray-700')}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsOpen(!isOpen);
                        }}
                    >
                        <ChevronDown className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Dropdown Menu (Absolute) */}
            {isOpen && (
                <div className={`absolute top-full left-0 right-0 mt-2 max-h-[280px] overflow-y-auto rounded-xl border shadow-lg z-50 animate-in slide-in-from-top-2 fade-in duration-150 custom-scrollbar ${mode('bg-white border-slate-200', 'bg-gray-900 border-gray-700')
                    }`}>
                    <div className="p-1.5 flex flex-col gap-0.5">
                        {filteredExams.length > 0 ? (
                            filteredExams.map((exam) => {
                                const isSavingThis = savingId === exam.id;
                                return (
                                    <button
                                        key={exam.id}
                                        onClick={() => {
                                            if (!savingId) handleExamSelect(exam);
                                        }}
                                        disabled={savingId !== null}
                                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-colors ${isSavingThis
                                            ? mode('bg-blue-50', 'bg-blue-500/10')
                                            : mode('hover:bg-slate-50', 'hover:bg-gray-800')
                                            }`}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <span className="text-lg flex-shrink-0">{exam.icon}</span>
                                            <div className="truncate">
                                                <div className={`text-sm font-semibold truncate ${isSavingThis ? mode('text-blue-700', 'text-blue-400') : mode('text-slate-800', 'text-slate-200')
                                                    }`}>
                                                    {exam.name}
                                                </div>
                                                <div className={`text-xs truncate ${mode('text-slate-500', 'text-gray-500')}`}>
                                                    {exam.parentCategory}
                                                </div>
                                            </div>
                                        </div>
                                        {isSavingThis && (
                                            <Loader2 className={`w-4 h-4 animate-spin flex-shrink-0 ${mode('text-blue-600', 'text-blue-400')}`} />
                                        )}
                                    </button>
                                );
                            })
                        ) : (
                            <div className="px-4 py-8 text-center">
                                <Monitor className={`w-8 h-8 mx-auto mb-2 opacity-50 ${mode('text-slate-400', 'text-gray-500')}`} />
                                <p className={`text-sm font-medium ${mode('text-slate-700', 'text-slate-300')}`}>No matches found</p>
                                <p className={`text-xs mt-1 ${mode('text-slate-500', 'text-gray-500')}`}>Try another keyword.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Embedded custom scrollbar for dropdown */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { 
                    background-color: ${isDark ? '#374151' : '#cbd5e1'}; 
                    border-radius: 10px; 
                }
            `}} />
        </div>
    );

    if (isModal) {
        return (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={(e) => {
                // Close dropdown if clicking backdrop
                if (isOpen) setIsOpen(false);
            }}>
                <div
                    className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
                    onClick={() => !savingId && onSkip && onSkip()}
                />
                <div onClick={e => e.stopPropagation()} className="w-full max-w-[420px] relative z-20">
                    {content}
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-[100dvh] flex items-center justify-center p-4 ${mode('bg-slate-50', 'bg-gray-950')
            }`}>
            {content}
        </div>
    );
};

export default ExamGoalSelector;