import React from 'react';
import AvatarWithBubble from '../components/avatars/AvatarWithBubble';

const incidents = [
  {id:1, title:'Caller asked for OTP', persona:'elderly', details:'Caller claimed to be bank asking for OTP.'},
  {id:2, title:'Refund link', persona:'adult', details:'Unknown link claims refund.'},
  {id:3, title:'Malicious video', persona:'child', details:'Video link asks to download app.'}
];

export default function IncidentsMascotDemo(){
  return (
    <div className="p-6">
      <header className="p-4 rounded-lg bg-gradient-to-r from-green-400 to-blue-500 text-white">
        <h1 className="text-2xl font-bold">Incidents</h1>
      </header>
      <div className="mt-4 space-y-4">
        {incidents.map(it=>(
          <div key={it.id} className="bg-white p-4 rounded-lg shadow-sm flex gap-4 items-start">
            <AvatarWithBubble persona={it.persona} tip={it.persona==='elderly'?'Verify family members.' : 'Do not click unknown links.'} size={88} />
            <div>
              <div className="font-semibold">{it.title}</div>
              <div className="text-sm text-gray-600 mt-1">{it.details}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
