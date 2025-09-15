import React from 'react';
import AvatarWithBubble from '../components/avatars/AvatarWithBubble';
import AnimatedButton from '../components/AnimatedButton';

const mock = [
  {id:1, title:'Fake grandchild urgent text', persona:'elderly', severity:'high'},
  {id:2, title:'Spoofed bank call', persona:'adult', severity:'high'},
  {id:3, title:'Malicious streaming link', persona:'child', severity:'medium'}
];

export default function DashboardMascotDemo(){
  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-500">Dashboard - Mascots Demo</h1>
        <AnimatedButton>Scan Now</AnimatedButton>
      </header>
      <section className="grid gap-4">
        {mock.map(a=>(
          <div key={a.id} className="bg-white p-4 rounded-lg shadow-sm flex items-center gap-4">
            <AvatarWithBubble persona={a.persona} tip={a.persona==='elderly'?'Never send money to strangers.':'Do not share OTP.'} size={64} />
            <div className="flex-1">
              <div className="font-semibold">{a.title}</div>
              <div className="text-xs text-gray-500">{a.severity} • {a.persona} scam</div>
            </div>
            <div className={`px-2 py-1 rounded text-white ${a.severity==='high'?'bg-red-500':'bg-yellow-400'}`}>{a.severity}</div>
          </div>
        ))}
      </section>
    </div>
  );
}
