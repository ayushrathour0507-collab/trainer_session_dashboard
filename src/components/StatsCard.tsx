import { useState, useEffect } from 'react';

interface StatsCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: React.ReactNode;
  trend?: number;
  gradient?: 'amber' | 'emerald' | 'cyan' | 'rose';
}

export function StatsCard({ label, value, sub, icon, trend, gradient = 'amber' }: StatsCardProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const gradientClasses = {
    amber: 'from-amber-600 to-orange-600',
    emerald: 'from-emerald-600 to-teal-600',
    cyan: 'from-cyan-600 to-blue-600',
    rose: 'from-rose-600 to-pink-600',
  };

  return (
    <div className={`relative group ${isVisible ? 'slide-up' : 'opacity-0'}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl border dark:border-slate-800 p-6 card-3d">
        <div className="flex items-start justify-between mb-4">
          {icon && (
            <div className={`p-3 rounded-lg bg-gradient-to-br ${gradientClasses[gradient]} text-white shadow-lg`}>
              {icon}
            </div>
          )}
          {trend !== undefined && (
            <div className={`text-xs font-bold px-2 py-1 rounded-full ${trend > 0 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </div>
          )}
        </div>
        <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{label}</div>
        <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">{value}</div>
        {sub && <div className="text-xs text-slate-400 dark:text-slate-500">{sub}</div>}
      </div>
    </div>
  );
}

export function CircleProgress({ percentage, size = 100, label, color = 'amber' }: { percentage: number; size?: number; label: string; color?: string }) {
  const radius = size / 2 - 5;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const colorMap = {
    amber: { bg: '#dbeafe', stroke: '#f59e0b', text: '#92400e' },
    emerald: { bg: '#d1fae5', stroke: '#10b981', text: '#065f46' },
    cyan: { bg: '#cffafe', stroke: '#06b6d4', text: '#164e63' },
    rose: { bg: '#ffe4e6', stroke: '#f43f5e', text: '#831843' },
  };

  const colors = colorMap[color as keyof typeof colorMap] || colorMap.amber;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={colors.bg} strokeWidth="3" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={colors.stroke}
            strokeWidth="3"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="stat-ring transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-xl font-black" style={{ color: colors.stroke }}>
              {percentage.toFixed(0)}%
            </div>
          </div>
        </div>
      </div>
      <div className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-300 text-center">{label}</div>
    </div>
  );
}
