import {parsePattern} from './pattern.js';

export function readProgressBackup(value){
  if(!value||value.kind!=='loop-studio-progress'||value.version!==1||value.progressUnit!=='action')throw Error('This is not a supported Loop Studio progress backup.');
  if(typeof value.text!=='string'||value.text.length>100000||typeof value.paste!=='string'||value.paste.length>100000)throw Error('The backup has invalid or oversized pattern text.');
  const parsed=parsePattern(value.text);
  if(!parsed.supported||!parsed.rounds.every(r=>!r.rowMode&&r.ops.every(op=>['sc','inc','dec','sc2inc','sc2tog','sc2dec'].includes(op))))throw Error('The backup pattern is not valid for the SC/INC/DEC workspace.');
  const {round,stitch}=value.progress||{};
  if(!Number.isInteger(round)||!Number.isInteger(stitch)||round<0||round>=parsed.rounds.length||stitch<0||stitch>parsed.rounds[round].ops.length)throw Error('The saved position is outside the pattern.');
  return {text:value.text,paste:value.paste,progress:{round,stitch},roundNumber:parsed.rounds[round].number};
}
export function createProgressBackup(text,paste,progress){
  const backup={kind:'loop-studio-progress',version:1,progressUnit:'action',exportedAt:new Date().toISOString(),text,paste,progress};
  readProgressBackup(backup);return backup;
}
