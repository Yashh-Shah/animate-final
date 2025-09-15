import React, {useState} from 'react';
import AvatarVariants from '../components/avatars/AvatarVariants';
import confetti from 'canvas-confetti';
import AnimatedButton from '../components/AnimatedButton';

const qa = [
  {id:1, persona:'elderly', q:'Caller asks for OTP to verify account. Is this a scam?', a:'Yes'},
  {id:2, persona:'adult', q:'Unknown number sends link asking to claim refund. Click it?', a:'No'}
];

export default function LearnMascotDemo(){
  const [state, setState] = useState<{[k:number]:string}>({});
  function answer(qid:number, ans:string){
    const correct = qa.find(x=>x.id===qid)?.a === ans;
    setState(s=>({...s, [qid]: correct ? 'correct' : 'wrong'}));
    if(correct){
      confetti({
        particleCount: 40,
        spread: 55,
        origin: { y: 0.6 }
      });
    }
  }
  return (
    <div className="p-6">
      <header className="p-4 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-500 text-white">
        <h1 className="text-2xl font-bold">Scam Spotter — Demo</h1>
      </header>
      <div className="mt-4 grid gap-4">
        {qa.map(item=>(
          <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm flex gap-4 items-start">
            <div>
              <AvatarVariants persona={item.persona as any} variant={state[item.id]==='correct'?'happy':state[item.id]==='wrong'?'alert':'default'} size={88} className={state[item.id]==='correct'?'animate-cheer-anim':''} />
            </div>
            <div className="flex-1">
              <div className="font-semibold">{item.q}</div>
              <div className="mt-3 flex gap-3">
                <AnimatedButton onClick={()=>answer(item.id, 'Yes')}>Yes</AnimatedButton>
                <button className="px-3 py-2 rounded border" onClick={()=>answer(item.id, 'No')}>No</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
