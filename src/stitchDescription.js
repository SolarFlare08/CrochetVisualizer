import {operation} from './language.js';

// Counter positions refer to output stitches, so an INC occupies two positions.
export function stitchDescription(round,index){
  let start=0;
  for(const op of round?.ops||[]){
    const {used,made,type}=operation(op);
    if(index>=start&&index<start+made){
      if(made>1)return `INC · ${index-start+1} of ${made}`;
      if(used>1)return 'DEC';
      return type.toUpperCase();
    }
    start+=made;
  }
  return '';
}
