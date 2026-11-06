import React from 'react';
import {Undo2,Redo2} from 'lucide-react';
import './patternHistory.css';

export default function PatternHistoryControls({undo,redo,canUndo,canRedo}){
  return <><div className="pattern-history-controls"><button type="button" onClick={undo} disabled={!canUndo} title="Undo pattern edit (Ctrl+Z)" aria-label="Undo pattern edit"><Undo2 size={14}/> Undo</button><button type="button" onClick={redo} disabled={!canRedo} title="Redo pattern edit (Ctrl+Shift+Z or Ctrl+Y)" aria-label="Redo pattern edit"><Redo2 size={14}/> Redo</button></div><small className="pattern-history-hint">Undo edits with Ctrl+Z · Redo with Ctrl+Shift+Z.<br/>Undo restores the saved position from before the edit.</small></>;
}
