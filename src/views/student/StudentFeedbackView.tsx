import React, { useState } from 'react';
import { UserProfile, Bus } from '../../types';
import { store } from '../../services/store';
import { authService } from '../../services/authService';
import {
  Star,
  Send,
  MessageSquare,
  CheckCircle2,
  ThumbsUp,
  AlertCircle,
  Clock,
  Users,
} from 'lucide-react';

interface StudentFeedbackViewProps {
  currentUser: UserProfile;
  buses: Bus[];
}

export const StudentFeedbackView: React.FC<StudentFeedbackViewProps> = ({
  currentUser,
  buses,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [busId, setBusId] = useState<string>('bus-03');
  const [category, setCategory] = useState<'PUNCTUALITY' | 'CROWDING' | 'DRIVING' | 'CLEANLINESS' | 'OTHER'>('PUNCTUALITY');
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    const issueTypeMap: Record<string, any> = {
      PUNCTUALITY: 'Bus Late',
      CROWDING: 'Bus Crowded',
      DRIVING: 'Driver Behavior',
      CLEANLINESS: 'Other',
      OTHER: 'Other',
    };

    store.submitFeedback({
      studentId: currentUser.id,
      studentName: currentUser.name,
      busId,
      rating,
      issueType: issueTypeMap[category] || 'Other',
      comment,
    });

    // Also push to Supabase student_feedback table
    await authService.submitFeedback({
      studentUsn: currentUser.studentId || currentUser.id,
      studentName: currentUser.name,
      busId,
      category,
      message: comment,
      rating,
    });

    setComment('');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              Commute Experience & Driver Feedback
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Help us optimize Ballari campus transit routes and reward punctual drivers.
            </p>
          </div>
        </div>

        {submitted && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Thank you, {currentUser.name}! Your feedback has been recorded and routed to Campus Transit Ops.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
              Rate Today's Ride:
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`p-2 rounded-xl transition-all ${
                    rating >= star
                      ? 'text-amber-400 scale-110'
                      : 'text-slate-300 dark:text-slate-700 hover:text-slate-400'
                  }`}
                >
                  <Star className="w-8 h-8 fill-current" />
                </button>
              ))}
              <span className="text-xs font-bold text-slate-500 ml-2">
                {rating === 5 ? 'Exceptional ride' : rating >= 4 ? 'Good ride' : 'Needs attention'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Vehicle:
              </label>
              <select
                value={busId}
                onChange={(e) => setBusId(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
              >
                {buses.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.busNumber} ({b.plateNumber})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Category:
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
              >
                <option value="PUNCTUALITY">Punctuality & ETA Accuracy</option>
                <option value="CROWDING">Seat Availability & Crowding</option>
                <option value="DRIVING">Safe Driving & Courtesy</option>
                <option value="CLEANLINESS">Bus Cleanliness</option>
                <option value="OTHER">General Feedback</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Your Comments & Observations:
            </label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g. Bus arrived exactly on time at Gandhi Nagar stop, driving was very smooth."
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
          >
            <Send className="w-4 h-4" />
            <span>Submit Commuter Feedback</span>
          </button>
        </form>
      </div>
    </div>
  );
};
