import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getHexCode(str: string){
  let hash = 0;
  for(let i = 0;i<str.length;i++){
    hash = str.charCodeAt(i)+((hash<<5)-hash);
  }

  let color = '#';
  for(let i=0; i<3; i++){
    const value = (hash>>(i*8))&255;
    color += value.toString(16).padStart(2,'0');
  }
  
  return color;
}