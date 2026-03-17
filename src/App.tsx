import { useState, useMemo, useEffect, useCallback } from 'react';
import { ZenColors, presets } from 'zen-colors';
import type { BlobConfig, BlobShape, AnimationType, PresetName } from 'zen-colors';

const PRESET_DESCRIPTIONS: Record<PresetName, string> = {
  ember: 'Red and purple tones for creative energy',
  amber: 'Warm amber and orange for focus',
  glacier: 'Cool blue and cyan for productivity',
  subtle: 'Muted amber and magenta, understated',
  aurora: 'Green, teal and purple northern lights',
  sunset: 'Orange, pink and purple gradient sky',
  ocean: 'Deep blue and teal underwater tones',
  neon: 'Vibrant multi-color electric palette',
};

const ANIMATION_TYPES: AnimationType[] = [
  'drift',
  'pulse',
  'orbit',
  'breathe',
  'wander',
];

function animationDemoBlobs(type: AnimationType): BlobConfig[] {
  return [
    {
      color: '#6366f1',
      x: 50,
      y: 50,
      size: 35,
      opacity: 0.9,
      animation: { type, speed: 1, range: 20, phase: 0 },
    },
    {
      color: '#ec4899',
      x: 40,
      y: 45,
      size: 25,
      opacity: 0.7,
      animation: { type, speed: 0.8, range: 15, phase: 120 },
    },
  ];
}

export function App() {
  const [blur, setBlur] = useState(70);
  const [speed, setSpeed] = useState(1);
  const [blobCount, setBlobCount] = useState(3);
  const [selectedPreset, setSelectedPreset] = useState<PresetName>('ember');
  const [shape, setShape] = useState<BlobShape>('ellipse');
  const [interactive, setInteractive] = useState(true);

  const playgroundBlobs = useMemo<BlobConfig[]>(() => {
    const colors = ['#ff0055', '#8800ff', '#0066ff', '#00cc88', '#ff8800'];
    const animTypes: AnimationType[] = ['drift', 'breathe', 'wander', 'orbit', 'pulse'];
    const rotations = [0, -30, 45, -15, 60];
    const scales: [number, number][] = [[1.5, 0.8], [1.3, 0.9], [1.8, 0.6], [1.2, 1.0], [1.6, 0.7]];
    return Array.from({ length: blobCount }, (_, i) => {
      const [sx, sy] = scales[i % 5] ?? [1, 1];
      return {
        id: `pg-${i}`,
        color: colors[i % colors.length] ?? '#ff0055',
        x: 25 + (i * 50) / Math.max(blobCount - 1, 1),
        y: 35 + (i % 2 === 0 ? 0 : 30),
        size: 30 - i * 3,
        opacity: 0.85 - i * 0.05,
        shape,
        scaleX: shape === 'circle' || shape === 'ring' ? 1 : sx,
        scaleY: shape === 'circle' || shape === 'ring' ? 1 : sy,
        rotation: shape === 'circle' || shape === 'ring' ? 0 : (rotations[i % 5] ?? 0),
        animation: {
          type: animTypes[i % 5] ?? ('drift' as const),
          speed: 0.5 + i * 0.1,
          range: 12 + i * 2,
          phase: i * 72,
        },
      };
    });
  }, [blobCount, shape]);

  const [liveBlobs, setLiveBlobs] = useState<BlobConfig[]>(playgroundBlobs);
  const [blobsJson, setBlobsJson] = useState(() => JSON.stringify(playgroundBlobs, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);

  useEffect(() => {
    setLiveBlobs(playgroundBlobs);
    setBlobsJson(JSON.stringify(playgroundBlobs, null, 2));
    setJsonError(null);
  }, [playgroundBlobs]);

  const handleJsonChange = useCallback((value: string) => {
    setBlobsJson(value);
    try {
      const parsed: unknown = JSON.parse(value);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setLiveBlobs(parsed as BlobConfig[]);
        setJsonError(null);
      } else {
        setJsonError('Must be a non-empty array of blob configs');
      }
    } catch (err) {
      setJsonError(err instanceof Error ? err.message : 'Invalid JSON');
    }
  }, []);

  const randomizeBlobs = useCallback(() => {
    const shapes: BlobShape[] = ['circle', 'ellipse', 'beam', 'ring', 'triangle', 'scalene', 'square', 'pentagon'];
    const anims: AnimationType[] = ['drift', 'breathe', 'wander', 'orbit', 'pulse'];
    const count = 2 + Math.floor(Math.random() * 4);
    const rand = (min: number, max: number) => min + Math.random() * (max - min);
    const randHex = () => '#' + Array.from({ length: 6 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('');
    const blobs: BlobConfig[] = Array.from({ length: count }, (_, i) => {
      const s = shapes[Math.floor(Math.random() * shapes.length)] ?? 'circle';
      return {
        id: `rand-${i}`,
        color: randHex(),
        x: Math.round(rand(15, 85)),
        y: Math.round(rand(20, 80)),
        size: Math.round(rand(15, 50)),
        opacity: Math.round(rand(0.5, 1) * 100) / 100,
        shape: s,
        scaleX: s === 'circle' || s === 'ring' ? 1 : Math.round(rand(0.6, 2.0) * 10) / 10,
        scaleY: s === 'circle' || s === 'ring' ? 1 : Math.round(rand(0.5, 1.5) * 10) / 10,
        rotation: s === 'circle' || s === 'ring' ? 0 : Math.round(rand(-60, 60)),
        animation: {
          type: anims[Math.floor(Math.random() * anims.length)] ?? ('drift' as const),
          speed: Math.round(rand(0.2, 1.0) * 10) / 10,
          range: Math.round(rand(5, 20)),
          phase: Math.round(rand(0, 360)),
        },
      };
    });
    const json = JSON.stringify(blobs, null, 2);
    setBlobsJson(json);
    setLiveBlobs(blobs);
    setJsonError(null);
  }, []);

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
          {(Object.keys(presets) as PresetName[]).map((name) => (
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
        <h2>Playground</h2>
        <p className="subtitle">
          Tweak parameters in real time. Move your mouse over the preview for interaction.
        </p>
        <div className="playground-layout">
          <div className="playground-preview">
            <ZenColors
              width="100%"
              height="100%"
              background="#0a0a10"
              blur={blur}
              speed={speed}
              blobs={liveBlobs}
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
          <div className="editor-header">
            <label className="editor-label">Blob Configuration (JSON)</label>
            <button className="random-btn" onClick={randomizeBlobs}>Random</button>
          </div>
          <textarea
            className="blob-textarea"
            value={blobsJson}
            onChange={(e) => handleJsonChange(e.target.value)}
            spellCheck={false}
          />
          {jsonError && <div className="json-error">{jsonError}</div>}
        </div>
      </section>

      <footer className="footer">
        Zen Colors &middot; MIT License
      </footer>
    </>
  );
}
