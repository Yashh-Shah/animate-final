import React from 'react';
export default function AnimatedButton({children, onClick, className=''}:any){
  return (
    <button onClick={onClick} className={`px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 text-white transition-transform transform hover:-translate-y-1 hover:scale-[1.02] ${className}`}>
      {children}
    </button>
  )
}
