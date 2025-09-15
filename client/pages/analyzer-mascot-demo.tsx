import React, {useState} from 'react';
import AvatarVariants from '../components/avatars/AvatarVariants';
import AnimatedButton from '../components/AnimatedButton';

export default function AnalyzerMascotDemo(){
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<string|null>(null);
  async function handleAnalyze(){
    setAnalyzing(true); setResult(null);
    await new Promise(r=>setTimeout(r, 1400));
    setAnalyzing(false);
    setResult('Likely scam — asks for money urgently. Do not respond.');
  }
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Analyzer Demo</h1>
      <div className="mt-4 flex gap-4 items-start">
        <div>
          <AvatarVariants persona="adult" variant={analyzing?'thinking':'default'} size={96} className={analyzing?'animate-thinking-anim':''} />
        </div>
        <div className="flex-1">
          <textarea className="w-full border rounded p-2 h-28" placeholder="Paste text or link..." />
          <div className="mt-3 flex gap-2">
            <AnimatedButton onClick={handleAnalyze}>{analyzing?'Analyzing...':'Analyze'}</AnimatedButton>
          </div>
          {result && <div className="mt-4 bg-gray-50 p-3 rounded"><div className="font-medium">Explanation</div><div className="text-sm text-gray-700 mt-1">{result}</div></div>}
        </div>
      </div>
    </div>
  );
}
