export const APPEARANCES=[
  {id:'day',label:'Daylight',dark:false,icon:'sun',bg:'#f3f2ed',panel:'#ffffff',raised:'#f5f8fa',canvas:'#f3f2ed',ink:'#627e98',muted:'#8fa3b3',border:'#d4e0e8',accent:'#df8447',soft:'#fff1e5',grid:'#ffffff'},
  {id:'night',label:'Night',dark:true,icon:'moon',bg:'#141b23',panel:'#1c2631',raised:'#263947',canvas:'#141e28',ink:'#bfd1df',muted:'#92aabc',border:'#3b5264',accent:'#e49a60',soft:'#3c3027',grid:'#516e84'},
  {id:'halloween',label:'Halloween',dark:true,icon:'ghost',bg:'#1c1525',panel:'#281e34',raised:'#382744',canvas:'#21182c',ink:'#dfcbe9',muted:'#ac94bd',border:'#60406f',accent:'#f39742',soft:'#493024',grid:'#735384'},
  {id:'thanksgiving',label:'Thanksgiving',dark:false,icon:'leaf',bg:'#f0e6d5',panel:'#fffbf3',raised:'#f5ead9',canvas:'#eee0c9',ink:'#795e49',muted:'#a38b70',border:'#deccb3',accent:'#b96c37',soft:'#f3ddc1',grid:'#d2bda0'},
  {id:'christmas',label:'Christmas',dark:true,icon:'tree',bg:'#10251e',panel:'#19372d',raised:'#284b3d',canvas:'#10291f',ink:'#d0e5d9',muted:'#98b9a8',border:'#416653',accent:'#dc8373',soft:'#49332f',grid:'#4f7861'},
  {id:'ocean',label:'Ocean',dark:false,icon:'waves',bg:'#e9f2f4',panel:'#f8fcfd',raised:'#e8f3f6',canvas:'#dfeef1',ink:'#4e7482',muted:'#7e9ca8',border:'#c0dce2',accent:'#298e9b',soft:'#dbf0ef',grid:'#b4d5de'},
  {id:'lavender',label:'Lavender',dark:false,icon:'flower',bg:'#eee9f5',panel:'#fcfaff',raised:'#f0ebf7',canvas:'#e9e2f1',ink:'#78648e',muted:'#a18db1',border:'#d6c8e5',accent:'#9271b1',soft:'#eee2f7',grid:'#c9b6dc'},
];
export function appearanceFor(id){return APPEARANCES.find(t=>t.id===id)||APPEARANCES[0];}
export function appearanceStyle(theme){return Object.fromEntries(['bg','panel','raised','ink','muted','border','accent','soft'].map(key=>[`--skin-${key}`,theme[key]]));}
