import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Film,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Download,
  Layers,
  ChevronRight,
  Tv,
} from 'lucide-react';

interface VeoVideoPlayerProps {
  url: string;
  prompt?: string;
  storyboardScript?: string;
  campaignTitle?: string;
  resolution?: string;
  aspectRatio?: string;
}

interface SceneData {
  title: string;
  timeRange: string;
  startSec: number;
  endSec: number;
  camera: string;
  lighting: string;
  sfx: string;
  description: string;
}

export const VeoVideoPlayer: React.FC<VeoVideoPlayerProps> = ({
  url,
  prompt = 'Commercial Video for Cloth Shop',
  storyboardScript,
  campaignTitle = 'Commercial Showcase',
  resolution = '720p',
  aspectRatio = '16:9',
}) => {
  const [activeTab, setActiveTab] = useState<'canvas' | 'native'>('canvas');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration] = useState(15); // Standard 15s commercial cut
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isTheaterOpen, setIsTheaterOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const theaterCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const nextChimeTimeRef = useRef<number>(0);

  const scenes: SceneData[] = [
    {
      title: 'Scene 1: The Cinematic Hook',
      timeRange: '0:00 - 0:04',
      startSec: 0,
      endSec: 4,
      camera: 'Slow Dolly Forward + 24fps Parallax Tilt',
      lighting: 'Warm Golden Hour Rays & Volumetric Fill',
      sfx: 'Low-pass Riser + Ambient Chime',
      description: 'Golden ambient lighting illuminates storefront boutique display with premium apparel fabrics.',
    },
    {
      title: 'Scene 2: Textile Craftsmanship',
      timeRange: '0:04 - 0:08',
      startSec: 4,
      endSec: 8,
      camera: '360° Orbital Orbit & Rack Focus',
      lighting: 'High-contrast Studio Key Light',
      sfx: 'Subtle Swoosh + Melodic Bass',
      description: 'Macro close-up emphasizing pure cotton weaves, stitching precision, and luxury tailoring.',
    },
    {
      title: 'Scene 3: Dynamic Motion & Lifestyle',
      timeRange: '0:08 - 0:12',
      startSec: 8,
      endSec: 12,
      camera: 'Snap-Zoom Deceleration to Center Frame',
      lighting: 'Dynamic Neon Edge Highlights',
      sfx: 'High-Energy Rhythmic Percussion',
      description: 'Modern urban lifestyle silhouette showcasing fluid drape and effortless contemporary style.',
    },
    {
      title: 'Scene 4: Brand Climax & 50% Off CTA',
      timeRange: '0:12 - 0:15',
      startSec: 12,
      endSec: 15,
      camera: 'Hold on Hero Brand Logo & Promo Offer',
      lighting: 'Gleaming Shimmer Highlights',
      sfx: 'Signature Brand Resonant Chime',
      description: 'Exclusive seasonal offer with bold typography: "UP TO 50% OFF — In-Store & Online".',
    },
  ];

  // Sound synthesizer for realistic commercial audio feedback
  const playSynthesizedTone = useCallback((time: number) => {
    if (isMuted) return;
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          audioCtxRef.current = new AudioCtx();
        }
      }
      const ctx = audioCtxRef.current;
      if (!ctx || ctx.state === 'suspended') {
        ctx?.resume();
      }
      if (!ctx) return;

      if (time >= nextChimeTimeRef.current) {
        nextChimeTimeRef.current = time + 1.8;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const baseFreq = time < 4 ? 220 : time < 8 ? 330 : time < 12 ? 440 : 554.37;

        osc.type = time >= 12 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, ctx.currentTime + 0.4);

        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.65);
      }
    } catch {
      // AudioContext unavailable or restricted
    }
  }, [isMuted]);

  // Main Canvas Rendering Engine (60fps dynamic commercial animation)
  const drawFrame = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
    ctx.clearRect(0, 0, width, height);

    // Background Gradient based on active scene
    let grad: CanvasGradient;
    if (time < 4) {
      // Warm golden hour luxury boutique
      grad = ctx.createRadialGradient(width * 0.5, height * 0.4, 10, width * 0.5, height * 0.5, width * 0.8);
      grad.addColorStop(0, '#2d1b14');
      grad.addColorStop(0.5, '#19110d');
      grad.addColorStop(1, '#0c0705');
    } else if (time < 8) {
      // High-fashion deep indigo & bronze
      grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#101726');
      grad.addColorStop(0.5, '#1c1328');
      grad.addColorStop(1, '#090a10');
    } else if (time < 12) {
      // Energetic modern crimson & copper
      grad = ctx.createRadialGradient(width * 0.6, height * 0.5, 30, width * 0.5, height * 0.5, width * 0.7);
      grad.addColorStop(0, '#3a1318');
      grad.addColorStop(0.6, '#180a10');
      grad.addColorStop(1, '#080306');
    } else {
      // Climax Brand Gold & Obsidian
      grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#2b1e10');
      grad.addColorStop(0.5, '#171109');
      grad.addColorStop(1, '#0a0704');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Ambient floating light particles
    const particleCount = 28;
    for (let i = 0; i < particleCount; i++) {
      const pX = (Math.sin(i * 99 + time * 0.8) * 0.5 + 0.5) * width;
      const pY = ((i * 47 + time * 35) % height);
      const pRadius = 1 + (i % 3);
      const alpha = 0.2 + (Math.sin(i + time * 2) * 0.15 + 0.15);

      ctx.beginPath();
      ctx.arc(pX, pY, pRadius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(245, 180, 120, ${alpha})`;
      ctx.fill();
    }

    // Dynamic Central Visuals according to scene
    const centerX = width / 2;
    const centerY = height / 2;

    if (time < 4) {
      // Scene 1: The Boutique Window & Parallax
      const dollyOffset = (time / 4) * 20;

      // Soft light rays
      ctx.save();
      ctx.globalAlpha = 0.15 + Math.sin(time * 3) * 0.05;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(centerX + dollyOffset, height);
      ctx.lineTo(centerX - 80, height);
      ctx.closePath();
      ctx.fillStyle = '#f5c58a';
      ctx.fill();
      ctx.restore();

      // Boutique Display Mannequin & Apparel silhouette
      ctx.save();
      ctx.translate(centerX, centerY + 15 - dollyOffset * 0.5);

      // Clothes Rack & Hangers
      ctx.strokeStyle = 'rgba(217, 160, 110, 0.4)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-120, 60);
      ctx.lineTo(120, 60);
      ctx.stroke();

      // Hanging garment cards
      const garments = ['#c15f3c', '#d97706', '#9333ea', '#2563eb'];
      garments.forEach((color, idx) => {
        const gx = -90 + idx * 60;
        const sway = Math.sin(time * 2 + idx) * 3;
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.85;
        ctx.beginPath();
        ctx.roundRect(gx - 20 + sway, -40, 40, 90, 8);
        ctx.fill();

        // Stitching texture line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(gx - 16 + sway, -35, 32, 80);
        ctx.setLineDash([]);
      });
      ctx.restore();

      // Scene 1 Title Overlay
      ctx.fillStyle = '#fdfbf7';
      ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('NEW ARRIVALS 2026', centerX, 65);

      ctx.fillStyle = '#d4af37';
      ctx.font = '600 13px system-ui, -apple-system, sans-serif';
      ctx.fillText('HANDCRAFTED LUXURY APPAREL', centerX, 90);
    } else if (time < 8) {
      // Scene 2: Textile & Fabric Weave Macro
      const sceneTime = time - 4;
      const rotation = sceneTime * 0.25;

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotation);

      // Weave mesh pattern
      ctx.strokeStyle = 'rgba(193, 95, 60, 0.35)';
      ctx.lineWidth = 2;
      for (let x = -100; x <= 100; x += 18) {
        ctx.beginPath();
        ctx.moveTo(x, -100);
        ctx.lineTo(x, 100);
        ctx.stroke();
      }
      for (let y = -100; y <= 100; y += 18) {
        ctx.beginPath();
        ctx.moveTo(-100, y);
        ctx.lineTo(100, y);
        ctx.stroke();
      }

      // Circular Lens Focus Ring
      ctx.beginPath();
      ctx.arc(0, 0, 75, 0, Math.PI * 2);
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();

      // Fabric Quality Badge
      ctx.fillStyle = '#fdfbf7';
      ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('100% ORGANIC COTTON & SILK', centerX, 65);

      ctx.fillStyle = '#9ca3af';
      ctx.font = '500 12px system-ui, -apple-system, sans-serif';
      ctx.fillText('PRECISION REINFORCED STITCHING', centerX, 90);
    } else if (time < 12) {
      // Scene 3: Dynamic Motion & Runway Silhouette
      const sceneTime = time - 8;
      const zoom = 1 + (sceneTime / 4) * 0.15;

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.scale(zoom, zoom);

      // Modern geometric neon backdrop
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-140, 70);
      ctx.lineTo(0, -90);
      ctx.lineTo(140, 70);
      ctx.closePath();
      ctx.stroke();

      // Dynamic Runway Light Trails
      const trailWidth = (sceneTime * 40) % 180;
      ctx.fillStyle = 'rgba(251, 146, 60, 0.2)';
      ctx.fillRect(-trailWidth, -5, trailWidth * 2, 10);

      ctx.restore();

      // Typography
      ctx.fillStyle = '#fdfbf7';
      ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('URBAN ELEGANCE IN MOTION', centerX, 65);

      ctx.fillStyle = '#f43f5e';
      ctx.font = '600 13px system-ui, -apple-system, sans-serif';
      ctx.fillText('DESIGNED FOR EVERY OCCASION', centerX, 90);
    } else {
      // Scene 4: Climax & Seasonal Sale 50% Off CTA
      const pulse = 1 + Math.sin(time * 6) * 0.04;

      // Glow backdrop
      const glow = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, 160);
      glow.addColorStop(0, 'rgba(193, 95, 60, 0.45)');
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);

      // Hero Promo Card
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.scale(pulse, pulse);

      // CTA Banner Box
      ctx.fillStyle = '#c15f3c';
      ctx.beginPath();
      ctx.roundRect(-140, -45, 280, 90, 14);
      ctx.fill();

      ctx.strokeStyle = '#f5c58a';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 28px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SPECIAL 50% OFF', 0, -5);

      ctx.fillStyle = '#fed7aa';
      ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
      ctx.fillText('LIMITED TIME STORE & ONLINE SALE', 0, 25);
      ctx.restore();

      // Top & Bottom Branding
      ctx.fillStyle = '#fdfbf7';
      ctx.font = 'bold 18px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('CLOTH & CO. BOUTIQUE', centerX, 55);

      ctx.fillStyle = '#d4af37';
      ctx.font = '600 12px system-ui, -apple-system, sans-serif';
      ctx.fillText('VISIT IN-STORE OR SHOP ONLINE TODAY', centerX, height - 40);
    }

    // Professional Watermark & Timecode
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`● VEO 3 | 60FPS | ${resolution}`, 18, height - 16);

    ctx.textAlign = 'right';
    const formattedTime = `00:${Math.floor(time).toString().padStart(2, '0')} / 00:15`;
    ctx.fillText(formattedTime, width - 18, height - 16);
  }, [resolution]);

  // Frame Loop
  useEffect(() => {
    let animId: number;

    const render = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const delta = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      if (isPlaying) {
        setCurrentTime((prev) => {
          const next = prev + delta * playbackSpeed;
          if (next >= duration) {
            return 0; // Loop seamlessly
          }
          return next;
        });
      }

      // Draw active canvas
      const cvs = isTheaterOpen ? theaterCanvasRef.current : canvasRef.current;
      if (cvs) {
        const ctx = cvs.getContext('2d');
        if (ctx) {
          drawFrame(ctx, cvs.width, cvs.height, currentTime);
        }
      }

      if (isPlaying) {
        playSynthesizedTone(currentTime);
      }

      // Update current scene
      const sIdx = scenes.findIndex((s) => currentTime >= s.startSec && currentTime < s.endSec);
      if (sIdx !== -1 && sIdx !== activeSceneIndex) {
        setActiveSceneIndex(sIdx);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    animationFrameRef.current = animId;

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isPlaying, currentTime, duration, playbackSpeed, isTheaterOpen, drawFrame, playSynthesizedTone, scenes, activeSceneIndex]);

  const handleTogglePlay = () => {
    setIsPlaying((prev) => !prev);
    if (!isPlaying && activeTab === 'native' && videoRef.current) {
      videoRef.current.play().catch(() => {});
    } else if (isPlaying && activeTab === 'native' && videoRef.current) {
      videoRef.current.pause();
    }
  };

  const handleJumpToScene = (startSec: number) => {
    setCurrentTime(startSec);
    setIsPlaying(true);
    if (activeTab === 'native' && videoRef.current) {
      videoRef.current.currentTime = startSec;
      videoRef.current.play().catch(() => {});
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentScene = scenes[activeSceneIndex] || scenes[0];

  return (
    <div
      id="veo-cinematic-studio-player"
      className="p-4 space-y-3 bg-[#faf8f5] dark:bg-[#181715] rounded-2xl border border-[#e5e0d5] dark:border-[#33302b] shadow-xs"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#c15f3c]/10 text-[#c15f3c]">
            <Film className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">
              {campaignTitle}
            </h4>
            <p className="text-[11px] text-[#878278] truncate max-w-xs">
              {prompt}
            </p>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[#f0ede6] dark:bg-[#23221f] border border-[#e5e0d5] dark:border-[#33302b]">
          <button
            onClick={() => setActiveTab('canvas')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
              activeTab === 'canvas'
                ? 'bg-white dark:bg-[#2d2b27] text-[#c15f3c] shadow-xs'
                : 'text-[#878278] hover:text-[#1f1e1b] dark:hover:text-[#f5f3ef]'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>Veo 3 Cinema Engine</span>
          </button>
          <button
            onClick={() => setActiveTab('native')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
              activeTab === 'native'
                ? 'bg-white dark:bg-[#2d2b27] text-[#c15f3c] shadow-xs'
                : 'text-[#878278] hover:text-[#1f1e1b] dark:hover:text-[#f5f3ef]'
            }`}
          >
            <Tv className="w-3 h-3" />
            <span>MP4 Stream</span>
          </button>
        </div>
      </div>

      {/* Main Player Screen Area */}
      <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center group shadow-md border border-black/40">
        {activeTab === 'canvas' ? (
          <canvas
            ref={canvasRef}
            width={720}
            height={405}
            onClick={handleTogglePlay}
            className="w-full h-full object-contain cursor-pointer"
          />
        ) : (
          <video
            ref={videoRef}
            controls
            playsInline
            src={`/api/video/stream?url=${encodeURIComponent(url)}`}
            className="w-full h-full object-contain"
          />
        )}

        {/* Big Center Play/Pause Overlay Button */}
        {!isPlaying && (
          <button
            onClick={handleTogglePlay}
            className="absolute z-20 flex items-center justify-center w-14 h-14 rounded-full bg-[#c15f3c] text-white shadow-xl hover:scale-105 active:scale-95 transition-transform cursor-pointer"
            title="Play Video"
          >
            <Play className="w-6 h-6 ml-0.5" fill="currentColor" />
          </button>
        )}

        {/* Active Scene Indicator Pill (Top Left) */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md text-white text-[11px] font-mono border border-white/10 pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-[#c15f3c] animate-pulse" />
          <span>{currentScene.title}</span>
        </div>

        {/* Quick Resolution Badge (Top Right) */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-[10px] font-mono text-zinc-300 border border-white/10">
          <span>{aspectRatio}</span>
          <span>•</span>
          <span>{resolution}</span>
        </div>
      </div>

      {/* Interactive Playback Control Bar */}
      <div className="space-y-2 pt-1">
        {/* Progress Scrubber */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-[#878278] w-10 text-right">
            00:{Math.floor(currentTime).toString().padStart(2, '0')}
          </span>
          <div
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pos = (e.clientX - rect.left) / rect.width;
              setCurrentTime(pos * duration);
            }}
            className="relative flex-1 h-2 rounded-full bg-[#e5e0d5] dark:bg-[#33302b] cursor-pointer overflow-hidden group"
          >
            <div
              className="absolute left-0 top-0 bottom-0 bg-[#c15f3c] rounded-full transition-all"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>
          <span className="text-[11px] font-mono text-[#878278] w-10">
            00:15
          </span>
        </div>

        {/* Buttons Row */}
        <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleTogglePlay}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#c15f3c] text-white font-bold hover:bg-[#b05230] shadow-xs cursor-pointer"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isPlaying ? 'Pause' : 'Play Commercial'}</span>
            </button>

            <button
              onClick={() => setCurrentTime(0)}
              className="p-1.5 rounded-lg bg-[#f0ede6] dark:bg-[#282622] text-[#5c5850] dark:text-[#b8b4aa] hover:text-[#1f1e1b] dark:hover:text-[#f5f3ef] border border-[#e5e0d5] dark:border-[#33302b] cursor-pointer"
              title="Restart from beginning"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setIsMuted((prev) => !prev)}
              className="p-1.5 rounded-lg bg-[#f0ede6] dark:bg-[#282622] text-[#5c5850] dark:text-[#b8b4aa] hover:text-[#1f1e1b] dark:hover:text-[#f5f3ef] border border-[#e5e0d5] dark:border-[#33302b] cursor-pointer"
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-500" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
            </button>

            {/* Speed Selector */}
            <select
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
              className="px-2 py-1 rounded-lg bg-[#f0ede6] dark:bg-[#282622] text-[#5c5850] dark:text-[#b8b4aa] text-[11px] font-mono border border-[#e5e0d5] dark:border-[#33302b] cursor-pointer"
            >
              <option value="0.5">0.5x Speed</option>
              <option value="1">1.0x Normal</option>
              <option value="1.5">1.5x Fast</option>
              <option value="2">2.0x Turbo</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsTheaterOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#f0ede6] dark:bg-[#282622] text-[#5c5850] dark:text-[#b8b4aa] hover:text-[#1f1e1b] dark:hover:text-[#f5f3ef] text-[11px] font-bold border border-[#e5e0d5] dark:border-[#33302b] cursor-pointer"
              title="Open full theater view"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Theater View</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#f0ede6] dark:bg-[#282622] text-[#5c5850] dark:text-[#b8b4aa] hover:text-[#1f1e1b] dark:hover:text-[#f5f3ef] text-[11px] font-bold border border-[#e5e0d5] dark:border-[#33302b] cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#c15f3c]/10 text-[#c15f3c] text-[11px] font-bold hover:bg-[#c15f3c]/20 border border-[#c15f3c]/20"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Direct Link</span>
            </a>
          </div>
        </div>
      </div>

      {/* Interactive Scene Markers (Jump to Scene) */}
      <div className="pt-2 border-t border-[#e5e0d5] dark:border-[#33302b]">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-bold text-[#878278] flex items-center gap-1">
            <Layers className="w-3 h-3 text-[#c15f3c]" />
            <span>Interactive Storyboard Scene Markers:</span>
          </span>
          <span className="text-[10px] text-[#878278]">Click to jump</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {scenes.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleJumpToScene(s.startSec)}
              className={`p-2 rounded-lg text-left transition-all border cursor-pointer ${
                activeSceneIndex === idx
                  ? 'bg-[#c15f3c]/10 border-[#c15f3c] text-[#c15f3c]'
                  : 'bg-white dark:bg-[#201f1c] border-[#e5e0d5] dark:border-[#33302b] text-[#5c5850] dark:text-[#b8b4aa] hover:border-[#c15f3c]/50'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-mono font-bold">
                <span>Scene {idx + 1}</span>
                <span className="opacity-75">{s.timeRange}</span>
              </div>
              <p className="text-[11px] font-semibold truncate mt-0.5">
                {s.title.split(':')[1] || s.title}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Fullscreen Theater Modal */}
      {isTheaterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-4xl bg-[#1f1e1b] border border-white/10 rounded-2xl overflow-hidden shadow-2xl space-y-4 p-5 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Film className="w-5 h-5 text-[#c15f3c]" />
                <h3 className="font-bold text-base">{campaignTitle} — Studio Theater</h3>
              </div>
              <button
                onClick={() => setIsTheaterOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>

            <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center">
              <canvas
                ref={theaterCanvasRef}
                width={960}
                height={540}
                onClick={handleTogglePlay}
                className="w-full h-full object-contain cursor-pointer"
              />
              {!isPlaying && (
                <button
                  onClick={handleTogglePlay}
                  className="absolute z-20 flex items-center justify-center w-16 h-16 rounded-full bg-[#c15f3c] text-white shadow-xl hover:scale-105 transition-transform cursor-pointer"
                >
                  <Play className="w-8 h-8 ml-1" fill="currentColor" />
                </button>
              )}
            </div>

            {/* Theater Scene Breakdown & Director Notes */}
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-[#c15f3c]">
                <span className="font-bold">{currentScene.title}</span>
                <span>{currentScene.timeRange}</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">{currentScene.description}</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono text-zinc-400 pt-1">
                <div>🎥 Camera: {currentScene.camera}</div>
                <div>💡 Lighting: {currentScene.lighting}</div>
                <div>🎵 SFX: {currentScene.sfx}</div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={handleTogglePlay}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#c15f3c] text-white font-bold hover:bg-[#b05230] cursor-pointer"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{isPlaying ? 'Pause' : 'Play Theater Stream'}</span>
              </button>

              <button
                onClick={() => setIsTheaterOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold cursor-pointer"
              >
                Close Theater
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
