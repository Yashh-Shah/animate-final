import React, {useState} from 'react';
import AvatarVariants from './AvatarVariants';
export default function AvatarWithBubble({persona='adult', tip='', size=80}:{persona?:any; tip?:string; size?:number}){
  const [open, setOpen] = useState(false);
  return (
    <div onMouseEnter={()=>setOpen(true)} onMouseLeave={()=>setOpen(false)} className="relative inline-flex items-center">
      <AvatarVariants persona={persona} size={size} className="rounded-full overflow-hidden" />
      {open && (
        <div className="absolute left-full ml-3 w-64 bg-white p-3 rounded shadow z-20">
          <div className="font-medium text-gray-900">Tip</div>
          <div className="text-sm text-gray-700 mt-1">{tip || 'Be careful — verify callers and links.'}</div>
        </div>
      )}
    </div>
  );
}
