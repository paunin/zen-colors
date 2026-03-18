import { useState } from 'react';
import { ZenColors, presets } from 'zen-colors';
import type { BlobConfig, BlobShape, AnimationType, PresetName } from 'zen-colors';
import { usePlayground } from './hooks/usePlayground';
import { JsonEditor } from './components/JsonEditor';

const PRESET_DESCRIPTIONS: Record<PresetName, string> = {
  ember: 'Red and purple tones for creative energy',
  amber: 'Warm amber and orange for focus',
  glacier: 'Cool blue and cyan for productivity',
  subtle: 'Muted amber and magenta, understated',
  aurora: 'Green, teal and purple northern lights',
  sunset: 'Orange, pink and purple gradient sky',
  ocean: 'Deep blue and teal underwater tones',
  neon: 'Vibrant multi-color electric palette',
  lava: 'Molten orange and red, slow-moving glow',
  nebula: 'Deep-space violet, rose and cyan gas clouds',
  sakura: 'Soft cherry blossom pinks and whites',
  matrix: 'Green digital rain cascading beams',
};

const ANIMATION_TYPES: AnimationType[] = [
  'drift',
  'pulse',
  'orbit',
  'breathe',
  'wander',
];

const ANIMATION_COLORS: Record<AnimationType, [string, string]> = {
  drift: ['#3b82f6', '#06b6d4'],
  pulse: ['#ef4444', '#f97316'],
  orbit: ['#a855f7', '#ec4899'],
  breathe: ['#10b981', '#34d399'],
  wander: ['#f59e0b', '#eab308'],
  none: ['#6b7280', '#9ca3af'],
};

function animationDemoBlobs(type: AnimationType): BlobConfig[] {
  const [primary, secondary] = ANIMATION_COLORS[type] ?? ['#6366f1', '#ec4899'];
  return [
    {
      color: primary,
      x: 50,
      y: 50,
      size: 35,
      opacity: 0.9,
      animation: { type, speed: 1, range: 20, phase: 0 },
    },
    {
      color: secondary,
      x: 40,
      y: 45,
      size: 25,
      opacity: 0.7,
      animation: { type, speed: 0.8, range: 15, phase: 120 },
    },
  ];
}

export function App() {
  const [selectedPreset, setSelectedPreset] = useState<PresetName>('ember');

  const {
    blur, setBlur,
    speed, setSpeed,
    blobCount, setBlobCount,
    shape, setShape,
    interactive, setInteractive,
    sizeAdjust, setSizeAdjust,
    scaledBlobs,
    blobsJson, setBlobsJson,
    jsonError,
    applyJson,
    randomizeBlobs,
  } = usePlayground();

  return (
    <>
      {/* ===== Hero ===== */}
      <section className="hero">
        <ZenColors
          width="100%"
          height="100%"
          {...presets[selectedPreset]}
          blur={90}
          style={{ position: 'absolute', inset: 0 }}
        />
        <div className="hero-content">
          <h1>Zen Colors</h1>
          <p>
            A React component for beautiful animated gradient
            blobs. Powered by Canvas&nbsp;2D with GPU-accelerated blur.
          </p>
          <nav className="hero-nav">
            <a href="#presets" className="primary">
              View Presets
            </a>
            <a href="#playground" className="secondary">
              Playground
            </a>
          </nav>
        </div>
      </section>

      {/* ===== Presets Gallery ===== */}
      <section className="section" id="presets">
        <h2>Presets</h2>
        <p className="subtitle">
          Eight built-in color palettes, or make your own.
          Click a preset to use it in the hero&nbsp;section.
        </p>
        <div className="preset-grid">
          {(Object.keys(presets) as PresetName[]).filter((n) => n !== 'matrix').map((name) => (
            <button
              key={name}
              className="preset-card"
              onClick={() => {
                setSelectedPreset(name);
                document.querySelector('.hero')?.scrollIntoView({ behavior: 'smooth' });
              }}
              style={{
                cursor: 'pointer',
                textAlign: 'left',
                font: 'inherit',
                color: 'inherit',
                borderColor:
                  selectedPreset === name
                    ? 'var(--color-accent)'
                    : undefined,
              }}
            >
              <div className="preset-preview">
                <ZenColors
                  width="100%"
                  height="100%"
                  {...presets[name]}
                />
              </div>
              <div className="preset-info">
                <h3>{name}</h3>
                <p>{PRESET_DESCRIPTIONS[name]}</p>
              </div>
            </button>
          ))}

          <button
            className="preset-card"
            onClick={() =>
              document
                .getElementById('playground')
                ?.scrollIntoView({ behavior: 'smooth' })
            }
            style={{
              cursor: 'pointer',
              textAlign: 'left',
              font: 'inherit',
              color: 'inherit',
              borderStyle: 'dashed',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              className="preset-preview"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--color-surface)',
                fontSize: '3rem',
                color: 'var(--color-text-dim)',
              }}
            >
              +
            </div>
            <div className="preset-info">
              <h3>Make your own</h3>
              <p>Open the playground and build a custom palette</p>
            </div>
          </button>
        </div>

        <div className="code-block">
          <span className="kw">import</span>
          {' { ZenColors, presets } '}
          <span className="kw">from</span>{' '}
          <span className="str">'zen-colors'</span>
          {'\n\n'}
          <span className="punct">{'<'}</span>
          <span className="comp">ZenColors</span>
          {' {'}
          <span className="punct">...</span>
          <span className="prop">presets</span>
          <span className="punct">.</span>
          {selectedPreset}
          {'} '}
          <span className="punct">{'/>'}</span>
        </div>
      </section>

      {/* ===== Animation Showcase ===== */}
      <section className="section" id="animations" style={{ paddingBottom: '3rem' }}>
        <h2>Animations</h2>
        <p className="subtitle">
          Five animation types control how blobs move, scale, and breathe.
        </p>
        <div className="animation-grid">
          {ANIMATION_TYPES.map((type) => (
            <div key={type} className="animation-card">
              <div className="animation-preview">
                <ZenColors
                  width="100%"
                  height="100%"
                  background="#111118"
                  blur={50}
                  blobs={animationDemoBlobs(type)}
                />
              </div>
              <div className="animation-label">{type}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== Interactive Playground ===== */}
      <section className="section" id="playground">
        <div className="section-header-row">
          <div>
            <h2>Playground</h2>
            <p className="subtitle">
              Tweak parameters in real time. Move your mouse over the preview for interaction.
            </p>
          </div>
          <a href="#/playground" className="fullscreen-link">Open Fullscreen</a>
        </div>
        <div className="playground-layout">
          <div className="playground-preview">
            <ZenColors
              width="100%"
              height="100%"
              background="#0a0a10"
              blur={blur}
              speed={speed}
              blobs={scaledBlobs}
              interactive={interactive}
              interactionStrength={40}
            />
          </div>

          <div className="playground-controls">
            <div className="control-group">
              <label>
                Blur <span>{blur}px</span>
              </label>
              <input
                type="range"
                min={0}
                max={150}
                value={blur}
                onChange={(e) => setBlur(Number(e.target.value))}
              />
            </div>

            <div className="control-group">
              <label>
                Speed <span>{speed.toFixed(1)}x</span>
              </label>
              <input
                type="range"
                min={0}
                max={3}
                step={0.1}
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
              />
            </div>

            <div className="control-group">
              <label>
                Blobs <span>{blobCount}</span>
              </label>
              <input
                type="range"
                min={1}
                max={5}
                value={blobCount}
                onChange={(e) => setBlobCount(Number(e.target.value))}
              />
            </div>

            <div className="control-group">
              <label>
                Size <span>{sizeAdjust > 0 ? '+' : ''}{sizeAdjust}%</span>
              </label>
              <input
                type="range"
                min={-100}
                max={100}
                value={sizeAdjust}
                onChange={(e) => setSizeAdjust(Number(e.target.value))}
              />
            </div>

            <div className="control-group">
              <label>Shape</label>
              <select
                value={shape}
                onChange={(e) => setShape(e.target.value as BlobShape)}
              >
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
              <select
                value={interactive ? 'on' : 'off'}
                onChange={(e) => setInteractive(e.target.value === 'on')}
              >
                <option value="on">On</option>
                <option value="off">Off</option>
              </select>
            </div>

          </div>
        </div>

        <div className="playground-editor">
          <label className="editor-label">Blob Configuration (JSON)</label>
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
      </section>

      {/* ===== Get Started ===== */}
      <section className="section" id="get-started">
        <h2>Use in Your Project</h2>
        <p className="subtitle">
          Install the package and drop the component into any React app.
        </p>

        <div className="get-started-block">
          <div className="get-started-step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Install</h3>
              <div className="code-block">npm install zen-colors</div>
            </div>
          </div>

          <div className="get-started-step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Import</h3>
              <div className="code-block">
                <span className="kw">import</span>
                {' { ZenColors, presets } '}
                <span className="kw">from</span>{' '}
                <span className="str">'zen-colors'</span>
              </div>
            </div>
          </div>

          <div className="get-started-step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Render</h3>
              <div className="code-block">
                <span className="punct">{'<'}</span>
                <span className="comp">ZenColors</span>
                {'\n  '}
                <span className="prop">width</span>
                <span className="punct">=</span>
                <span className="str">"100%"</span>
                {'\n  '}
                <span className="prop">height</span>
                <span className="punct">={'{'}</span>
                <span className="num">400</span>
                <span className="punct">{'}'}</span>
                {'\n  {'}
                <span className="punct">...</span>
                <span className="prop">presets</span>
                <span className="punct">.</span>
                {'ember}\n'}
                <span className="punct">{'/>'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="get-started-links">
          <a
            href="https://github.com/paunin/zen-colors"
            target="_blank"
            rel="noopener noreferrer"
            className="repo-link"
          >
            GitHub Repository
          </a>
          <a
            href="https://github.com/paunin/zen-colors#readme"
            target="_blank"
            rel="noopener noreferrer"
            className="repo-link secondary"
          >
            Full Documentation
          </a>
        </div>
      </section>

      <footer className="footer">
        Zen Colors &middot; MIT License &middot;{' '}
        <a
          href="https://github.com/paunin/zen-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
      </footer>
    </>
  );
}
