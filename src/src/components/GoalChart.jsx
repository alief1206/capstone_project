import React from 'react';

const GoalChart = ({ goal }) => {
    const configs = {
        turunkan: { path: "M 0 20 Q 50 40, 100 60 T 200 100 T 300 140 T 350 160", area: "M 0 20 Q 50 40, 100 60 T 200 100 T 300 140 T 350 160 V 200 H 0 Z", label: "Proyeksi Penurunan" },
        jaga: { path: "M 0 100 Q 50 90, 100 105 T 200 95 T 300 102 T 350 100", area: "M 0 100 Q 50 90, 100 105 T 200 95 T 300 102 T 350 100 V 200 H 0 Z", label: "Proyeksi Kestabilan" },
        tambah: { path: "M 0 160 Q 50 140, 100 130 T 200 90 T 300 50 T 350 30", area: "M 0 160 Q 50 140, 100 130 T 200 90 T 300 50 T 350 30 V 200 H 0 Z", label: "Proyeksi Kenaikan" }
    };
    const config = configs[goal] || configs.jaga;
    return (
        <div className="w-full h-[220px] bg-[#F0FDF4]/50 rounded-2xl border border-gray-100 p-4 relative overflow-hidden shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <span className="text-[12px] font-bold text-[#14AE5C] uppercase tracking-wider">{config.label}</span>
                <span className="text-[10px] font-semibold text-gray-400">Target 3-6 Bulan</span>
            </div>
            <svg viewBox="0 0 350 200" className="w-full h-[140px] drop-shadow-lg">
                <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#14AE5C" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#14AE5C" stopOpacity="0" />
                    </linearGradient>
                </defs>
                <path d={config.area} fill="url(#chartGradient)" />
                <path d={config.path} fill="none" stroke="#14AE5C" strokeWidth="4" strokeLinecap="round" className="animate-dash" style={{ strokeDasharray: 1000, strokeDashoffset: 0 }} />
                {[0, 100, 200, 300, 350].map((x, i) => (
                    <circle key={i} cx={x} cy={configs[goal]?.path.split(' ')[(i*2)+2] || 100} r="4" fill="white" stroke="#14AE5C" strokeWidth="2" />
                ))}
            </svg>
            <div className="absolute bottom-2 left-4 right-4 flex justify-between">
                <span className="text-[10px] font-bold text-gray-400">Mulai</span>
                <span className="text-[10px] font-bold text-gray-400">Target</span>
            </div>
        </div>
    );
};

export default GoalChart;