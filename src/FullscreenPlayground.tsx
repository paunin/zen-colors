import { ZenColors } from 'zen-colors';
import type { BlobShape } from 'zen-colors';
import { usePlayground } from './hooks/usePlayground';
import { JsonEditor } from './components/JsonEditor';

export function FullscreenPlayground() {
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

  return (
    <div className="fs-playground">
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
        style={{ position: 'fixed', inset: 0, zIndex: 0 }}
      />

      <div className="fs-panel">
        <div className="fs-panel-header">
          <h2>Playground</h2>
          <a href="#" className="fs-back-link">Back to site</a>
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
