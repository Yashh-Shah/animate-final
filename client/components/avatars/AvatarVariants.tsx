import React from 'react';
export type Persona = 'elderly'|'adult'|'child';
export type Variant = 'default'|'thinking'|'happy'|'alert';
export default function AvatarVariants({persona='adult', variant='default', size=80, className='' }:{persona?:Persona; variant?:Variant; size?:number; className?:string}){
  const file = `/avatars/${persona}${variant==='default'?'':`-${variant}`}.svg`;
  return <img src={file} width={size} height={size} className={className} alt={`${persona}-${variant}`} />;
}
