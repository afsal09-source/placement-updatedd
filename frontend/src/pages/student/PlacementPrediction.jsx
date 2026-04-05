import React, { useEffect, useState } from 'react'
import { studentAPI } from '../../services/api'
import { PageHeader, Spinner } from '../../components/common/UI'
import { TrendingUp, AlertTriangle, CheckCircle, Info, Lightbulb } from 'lucide-react'
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts'

export default function PlacementPrediction() {
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    studentAPI.predict()
      .then(r => setPrediction(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />
  if (!prediction) return (
    <div className="card flex items-center gap-3 text-yellow-700 bg-yellow-50 border-yellow-100">
      <AlertTriangle size={20} /> 
      <p className="text-sm">Could not calculate prediction. Please complete your profile and attend at least one interview.</p>
    </div>
  )

  const STATUS_CONFIG = {
    HIGH:   { color: '#10b981', bg: 'from-green-500 to-emerald-600', icon: CheckCircle, label: 'High Probability' },
    MEDIUM: { color: '#f59e0b', bg: 'from-yellow-400 to-orange-500', icon: Info, label: 'Medium Probability' },
    LOW:    { color: '#ef4444', bg: 'from-red-500 to-rose-600', icon: AlertTriangle, label: 'Low Probability' },
  }
  const cfg = STATUS_CONFIG[prediction.status] || STATUS_CONFIG.MEDIUM
  const Icon = cfg.icon

  const gaugeData = [{ value: prediction.probabilityPercent, fill: cfg.color }]

  return (
    <div className="space-y-6 fade-in max-w-2xl">
      <PageHeader
        title="Placement Prediction"
        subtitle="AI-powered analysis of your placement probability"
      />

      {/* Main prediction card */}
      <div className={`card bg-gradient-to-br ${cfg.bg} text-white border-0 text-center py-8`}>
        <div className="flex justify-center mb-4">
          <ResponsiveContainer width={180} height={180}>
            <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%"
                            startAngle={90} endAngle={-270} data={gaugeData}>
              <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
              <RadialBar background={{ fill: 'rgba(255,255,255,0.2)' }}
                         dataKey="value" angleAxisId={0} cornerRadius={10} />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-white/70 text-sm font-medium mb-1">Placement Probability</p>
        <p className="font-display text-6xl font-bold mb-2">{prediction.probabilityPercent?.toFixed(1)}%</p>
        <div className="flex items-center justify-center gap-2">
          <Icon size={18} />
          <span className="font-semibold text-lg">{cfg.label}</span>
        </div>
        <p className="text-white/80 text-sm mt-3 max-w-sm mx-auto">{prediction.message}</p>
      </div>

      {/* Score breakdown */}
      <div className="card">
        <h2 className="font-display font-bold text-gray-900 mb-4">Score Breakdown</h2>
        <div className="space-y-3">
          {[
            { label: 'Placement Score', val: prediction.placementScore, max: 5, desc: 'Combined weighted score' },
          ].map(({ label, val, max, desc }) => (
            <div key={label}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-medium text-gray-700">{label}</span>
                <span className="text-gray-500 font-semibold">{val?.toFixed(2)} / {max}</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                     style={{ width: `${(val / max) * 100}%`, background: cfg.color }} />
              </div>
              <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-500 border border-gray-100">
          <p className="font-semibold text-gray-700 mb-1">Formula Used:</p>
          <p className="font-mono">Score = (CGPA×0.3) + (Technical×0.3) + (Communication×0.2) + (ProblemSolving×0.2)</p>
        </div>
      </div>

      {/* Suggestions */}
      {prediction.suggestions?.length > 0 && (
        <div className="card border-l-4 border-l-primary-500">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb size={18} className="text-primary-600" />
            <h2 className="font-display font-bold text-gray-900">Improvement Suggestions</h2>
          </div>
          <ul className="space-y-2">
            {prediction.suggestions.map((s, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
