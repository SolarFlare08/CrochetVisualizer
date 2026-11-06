export const APPEARANCES=[
  {id:'day',label:'Daylight',dark:false,icon:'sun',bg:'#f3f2ed',panel:'#ffffff',raised:'#f5f8fa',canvas:'#f3f2ed',ink:'#627e98',muted:'#8fa3b3',border:'#d4e0e8',accent:'#df8447',soft:'#fff1e5',grid:'#ffffff'},
  {id:'night',label:'Night',dark:true,icon:'moon',bg:'#101214',panel:'#191c20',raised:'#24282e',canvas:'#11151a',ink:'#d4dce4',muted:'#96a2af',border:'#343a43',accent:'#91a9d4',secondary:'#a5b5cf',soft:'#272f40',grid:'#3c4655'},
  {id:'halloween',label:'Halloween',dark:false,icon:'ghost',bg:'#f3eee7',panel:'#fffaf2',raised:'#f7f0e8',canvas:'#f9f5ed',ink:'#342938',muted:'#8e7d92',border:'#e4d5c4',accent:'#cf6826',secondary:'#76548e',soft:'#fff0df',grid:'#d6c6b9'},
  {id:'thanksgiving',label:'Thanksgiving',dark:false,icon:'leaf',bg:'#f4f1eb',panel:'#fffdf9',raised:'#f7f3ed',canvas:'#f8f5ef',ink:'#615143',muted:'#9b8b7c',border:'#e4dbcf',accent:'#aa6337',secondary:'#8c694b',soft:'#f8eee2',grid:'#d7cec2'},
  {id:'christmas',label:'Christmas',dark:false,icon:'tree',bg:'#f1f1ec',panel:'#fffefa',raised:'#f5f6f0',canvas:'#f6f6f0',ink:'#38534a',muted:'#7f968a',border:'#d8e1d8',accent:'#bd4e4a',secondary:'#348262',soft:'#fbefeb',grid:'#ccd8cf'},
  {id:'ocean',label:'Ocean',dark:false,icon:'waves',bg:'#eff4f5',panel:'#fcfefe',raised:'#f2f7f8',canvas:'#f5fafb',ink:'#4e7482',muted:'#7e9ca8',border:'#d1e2e6',accent:'#298e9b',secondary:'#527fa2',soft:'#e9f5f4',grid:'#c6dce3'},
  {id:'lavender',label:'Lavender',dark:false,icon:'flower',bg:'#f4f1f7',panel:'#fefcff',raised:'#f7f3fa',canvas:'#faf7fc',ink:'#716080',muted:'#9f90ad',border:'#e0d6ea',accent:'#9271b1',secondary:'#817597',soft:'#f3eaf9',grid:'#d8cce6'},
];
export function appearanceFor(id){return APPEARANCES.find(t=>t.id===id)||APPEARANCES[0];}
export function appearanceStyle(theme){return Object.fromEntries(['bg','panel','raised','ink','muted','border','accent','soft','secondary'].map(key=>[`--skin-${key}`,theme[key]||theme.accent]));}
