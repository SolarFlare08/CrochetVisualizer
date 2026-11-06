import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createProgressBackup,readProgressBackup} from '../src/progressBackup.js';
const text='R1: 6 sc in MR (6)\nR2: inc x6 (12)';
test('backup roundtrip preserves pattern and action position within increase round',()=>{
  const restored=readProgressBackup(JSON.parse(JSON.stringify(createProgressBackup(text,'original source',{round:1,stitch:3}))));
  assert.equal(restored.text,text);assert.equal(restored.paste,'original source');assert.deepEqual(restored.progress,{round:1,stitch:3});
  assert.equal(restored.roundNumber,2);
});
test('import rejects mismatched format, invalid pattern and out-of-range positions',()=>{
  const backup=createProgressBackup(text,'',{round:1,stitch:6});
  for(const patch of [{version:2},{progressUnit:'output'},{text:'R1: unknown'},{progress:{round:1,stitch:7}},{progress:{round:0,stitch:-1}},{progress:{round:0,stitch:.5}}])assert.throws(()=>readProgressBackup({...backup,...patch}));
});
