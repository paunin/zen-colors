import { useState, useRef } from 'react';
import { ZenColors } from 'zen-colors';
import type { BlobShape } from 'zen-colors';
import { usePlayground } from './hooks/usePlayground';
import { useCanvasRecorder } from './hooks/useCanvasRecorder';
import { JsonEditor } from './components/JsonEditor';

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export function FullscreenPlayground() {
  const [panelHidden, setPanelHidden] = useState(false);
  const zenRef = useRef<HTMLDivElement>(null);

  const {
    blur, setBlur,
    speed, setSpeed,
    blobCount, setBlobCount,
    shape, setShape,
    interactive, setInteractive,
    sizeAdjust, setSizeAdjust,
    targetFps, setTargetFps,
    scaledBlobs,
    blobsJson, setBlobsJson,
    jsonError,
    applyJson,
    randomizeBlobs,
  } = usePlayground();

  const { recording, elapsed, start: startRec, stop: stopRec } = useCanvasRecorder(zenRef, blur, targetFps);

  return (
    <div className="fs-playground">
      <div ref={zenRef} style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        <ZenColors
          width="100%"
          height="100%"
          background="#0a0a10"
          blur={blur}
          speed={speed}
          blobs={scaledBlobs}
          interactive={interactive}
          interactionStrength={40}
          targetFps={targetFps}
        />
      </div>

      {panelHidden && (
        <button
          className="fs-toggle fs-toggle-edge"
          onClick={() => setPanelHidden(false)}
          title="Show panel"
        >
          {'\u00AB'}
        </button>
      )}

      <div className={`fs-panel${panelHidden ? ' fs-panel-hidden' : ''}`}>
        <div className="fs-panel-header">
          <div className="fs-panel-title">
            <button
              className="fs-toggle-inline"
              onClick={() => setPanelHidden(true)}
              title="Hide panel"
            >
              {'\u00BB'}
            </button>
            <h2>Playground</h2>
          </div>
          <div className="fs-header-actions">
            <button
              className={`rec-btn${recording ? ' rec-btn-active' : ''}`}
              onClick={recording ? stopRec : startRec}
              title={recording ? 'Stop recording' : 'Record video'}
            >
              <span className="rec-dot" />
              {recording ? formatTime(elapsed) : 'Rec'}
            </button>
            <a href="#" className="fs-back-link">{'\u2190'} Back to site</a>
          </div>
        </div>

        <div className="fs-controls">
          <div className="control-group">
            <label>Blur <span>{blur}px</span></label>
            <input type="range" min={0} max={150} value={blur} onChange={(e) => setBlur(Number(e.target.value))} />
          </div>
          <div className="control-group">
            <label>Speed <span>{speed.toFixed(1)}x</span></label>
            <input type="range" min={0} max={3} step={0.1} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} />
          </div>
          <div className="control-group">
            <label>Blobs <span>{blobCount}</span></label>
            <input type="range" min={1} max={5} value={blobCount} onChange={(e) => setBlobCount(Number(e.target.value))} />
          </div>
          <div className="control-group">
            <label>Size <span>{sizeAdjust > 0 ? '+' : ''}{sizeAdjust}%</span></label>
            <input type="range" min={-100} max={100} value={sizeAdjust} onChange={(e) => setSizeAdjust(Number(e.target.value))} />
          </div>
          <div className="control-group">
            <label>Shape</label>
            <select value={shape} onChange={(e) => setShape(e.target.value as BlobShape)}>
              <option value="circle">Circle</option>
              <option value="ellipse">Ellipse</option>
              <option value="beam">Beam</option>
              <option value="ring">Ring</option>
              <option value="triangle">Triangle</option>
              <option value="scalene">Scalene</option>
              <option value="square">Square</option>
              <option value="pentagon">Pentagon</option>
              <option value="poly">Poly (morphing)</option>
            </select>
          </div>
          <div className="control-group">
            <label>Interactive</label>
            <select value={interactive ? 'on' : 'off'} onChange={(e) => setInteractive(e.target.value === 'on')}>
              <option value="on">On</option>
              <option value="off">Off</option>
            </select>
          </div>
          <div className="control-group">
            <label>FPS <span>{targetFps}</span></label>
            <input type="range" min={0.5} max={60} step={0.5} value={targetFps} onChange={(e) => setTargetFps(Number(e.target.value))} />
          </div>
        </div>

        <div className="fs-editor">
          <div className="editor-body">
            <JsonEditor
              value={blobsJson}
              onChange={setBlobsJson}
              error={jsonError}
              minHeight="200px"
            />
            <div className="editor-actions">
              <button className="apply-btn" onClick={applyJson}>Apply</button>
              <button className="random-btn" onClick={randomizeBlobs}>Random</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
