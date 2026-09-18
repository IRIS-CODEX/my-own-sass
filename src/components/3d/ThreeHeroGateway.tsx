import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { useAppStore } from '../../stores/useAppStore';
import {
  Shield,
  Zap,
  Activity,
  Radio,
  Cpu,
  Sparkles,
  ArrowRight,
  Play,
  Layers,
  Crosshair,
  KeyRound,
  TrendingDown,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Car,
  Compass,
  Gauge,
  PlusCircle,
  Pause,
  RefreshCw,
  Building2,
  Lock,
} from 'lucide-react';

export interface AgentVehicleDetail {
  id: string;
  code: string;
  name: string;
  role: string;
  status: 'DRIVING' | 'DEPLOYING' | 'INTERCEPTED' | 'ESCROW_AUDIT';
  model: string;
  speed: string;
  latency: string;
  task: string;
  color: string;
  colorHex: number;
  batteryBudget: string;
  tokensProcessed: string;
  cryptoSignature: string;
  coordinates: string;
  description: string;
}

const INITIAL_AGENT_VEHICLES: AgentVehicleDetail[] = [
  {
    id: 'agent_deployer',
    code: 'FLEET-DEP-01',
    name: 'Agent Deployer Cruiser',
    role: 'Autonomous Microservice & Kubernetes Deployer',
    status: 'DEPLOYING',
    model: 'Gemini 2.0 Flash / CodeAct',
    speed: '142 km/h • 1,200 req/s',
    latency: '0.7ms AST',
    task: 'Pushing container hotfix v4.2 to Europe-West cluster',
    color: '#fbbf24', // Amber Gold
    colorHex: 0xfbbf24,
    batteryBudget: '$18.40 / $50.00 Daily Cap',
    tokensProcessed: '1,420,890 tokens',
    cryptoSignature: 'Ed25519: 0x9f4a...e10b',
    coordinates: 'Lane 1 • Sector A-4',
    description: 'Autonomous DevOps agent vehicle that builds, validates, and deploys isolated microservices while streaming live telemetry back to the central gateway.',
  },
  {
    id: 'agent_sentry',
    code: 'FLEET-SEC-02',
    name: 'Agent Sentry Patrol',
    role: 'Real-Time Prompt Injection & Firewall Interceptor',
    status: 'DRIVING',
    model: 'Claude 3.5 Sonnet / AST Shield',
    speed: '168 km/h • 840 req/s',
    latency: '1.1ms AST',
    task: 'Scanning agent API payloads for prompt injection & exfiltration',
    color: '#38bdf8', // Cyber Cyan
    colorHex: 0x38bdf8,
    batteryBudget: '$32.10 / $80.00 Daily Cap',
    tokensProcessed: '3,840,110 tokens',
    cryptoSignature: 'Ed25519: 0x3d7b...4c2a',
    coordinates: 'Lane 2 • Sector B-1',
    description: 'High-speed security cruiser scanning adjacent agent payloads for SQL injections, jailbreak attempts, and sensitive credential exfiltration.',
  },
  {
    id: 'agent_vault',
    code: 'FLEET-VLT-03',
    name: 'Agent Key Escrow Carrier',
    role: 'Hardware Enclave & Ephemeral Key Escrow',
    status: 'DRIVING',
    model: 'Nitro Enclave / Zero-Trust',
    speed: '120 km/h • 610 req/s',
    latency: '0.9ms AST',
    task: 'Delivering temporary 300s scoped proxy credentials to Worker #7',
    color: '#34d399', // Emerald
    colorHex: 0x34d399,
    batteryBudget: '$12.00 / $40.00 Daily Cap',
    tokensProcessed: '890,400 tokens',
    cryptoSignature: 'Nitro Enclave Attested',
    coordinates: 'Lane 3 • Sector C-3',
    description: 'Armored cryptographic transport vehicle distributing short-lived virtual keys and enforcing strict token spend caps across agent swarms.',
  },
  {
    id: 'agent_arbitrage',
    code: 'FLEET-ARB-04',
    name: 'Cost Arbitrage Express',
    role: 'Dynamic Model Routing & Semantic Token Optimizer',
    status: 'DRIVING',
    model: 'Multi-Router (Groq/Gemini/OpenAI)',
    speed: '195 km/h • 2,100 req/s',
    latency: '0.6ms AST',
    task: 'Rerouting 450 summary tasks to Gemini Flash to save $142',
    color: '#a855f7', // Purple Neon
    colorHex: 0xa855f7,
    batteryBudget: '$68% Saved • Net +$1,420',
    tokensProcessed: '6,102,900 tokens',
    cryptoSignature: 'Merkle Route Verified',
    coordinates: 'Lane 1 • Sector D-2',
    description: 'Rapid routing agent balancing network traffic across foundation models, slashing latency and enterprise compute expenditures.',
  },
  {
    id: 'agent_hitl',
    code: 'FLEET-HITL-05',
    name: 'Human-in-the-Loop Interceptor',
    role: 'Escrow Toll Gatekeeper on High-Risk Tool Actions',
    status: 'INTERCEPTED',
    model: 'Multi-Sig FIDO2 Enclave',
    speed: '0 km/h • Escrow Hold',
    latency: 'HOLD (TTL 280s)',
    task: 'Intercepted $14,500 wire transfer tool execution awaiting human sign-off',
    color: '#f59e0b', // Deep Amber
    colorHex: 0xf59e0b,
    batteryBudget: 'Escrow: $14,500 Locked',
    tokensProcessed: '450,200 tokens',
    cryptoSignature: 'FIDO2 Multi-Sig Pending',
    coordinates: 'Toll Gate Alpha • Intercepted',
    description: 'Safety vehicle stationed at the Zero-Trust Gate that intercepts high-stakes API invocations (database drops, financial disbursements) for human approval.',
  },
];

export const ThreeHeroGateway: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const theme = useAppStore((s) => s.theme);
  const { setAuthModalOpen, setSubscriptionModalOpen, setIsAdminView } = useAppStore();

  // Active Fleet state
  const [vehicles, setVehicles] = useState<AgentVehicleDetail[]>(INITIAL_AGENT_VEHICLES);
  const [hoveredVehicle, setHoveredVehicle] = useState<AgentVehicleDetail | null>(null);
  const [lockedVehicle, setLockedVehicle] = useState<AgentVehicleDetail>(INITIAL_AGENT_VEHICLES[0]);
  const [hudScreenPos, setHudScreenPos] = useState<{ x: number; y: number } | null>(null);

  // Fleet Command Toggles
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [isGateArmed, setIsGateArmed] = useState(true);
  const [viewAngle, setViewAngle] = useState<'ISOMETRIC' | 'DRONE' | 'CHASE'>('ISOMETRIC');
  const [deployedCount, setDeployedCount] = useState(5);
  const [lastEventToast, setLastEventToast] = useState<string>('Autonomous Fleet Operating Normally');

  // References for live 3D loop
  const runtimeRef = useRef({
    mouseX: 0,
    mouseY: 0,
    targetRotX: 0,
    targetRotY: 0,
    scrollY: 0,
    speedMultiplier: 1,
    isGateArmed: true,
    viewAngle: 'ISOMETRIC' as 'ISOMETRIC' | 'DRONE' | 'CHASE',
    hoveredId: null as string | null,
    spawnQueue: [] as { id: string; color: number }[],
  });

  useEffect(() => {
    runtimeRef.current.speedMultiplier = speedMultiplier;
  }, [speedMultiplier]);

  useEffect(() => {
    runtimeRef.current.isGateArmed = isGateArmed;
  }, [isGateArmed]);

  useEffect(() => {
    runtimeRef.current.viewAngle = viewAngle;
  }, [viewAngle]);

  // Deploy New Agent Action
  const handleDeployNewAgent = useCallback(() => {
    const colors = [0xfbbf24, 0x38bdf8, 0x34d399, 0xa855f7, 0xf43f5e, 0x06b6d4];
    const newIndex = deployedCount + 1;
    const colorHex = colors[newIndex % colors.length];

    const newAgent: AgentVehicleDetail = {
      id: `agent_custom_${Date.now()}`,
      code: `FLEET-WRK-${newIndex < 10 ? '0' + newIndex : newIndex}`,
      name: `Agent Worker Cruiser #${newIndex}`,
      role: 'Autonomous Task Synthesizer & API Executor',
      status: 'DEPLOYING',
      model: 'Gemini 2.0 Flash / AgentLang',
      speed: '160 km/h • 980 req/s',
      latency: '0.8ms AST',
      task: `Executing distributed batch pipeline job #${Math.floor(Math.random() * 9000 + 1000)}`,
      color: '#' + colorHex.toString(16).padStart(6, '0'),
      colorHex: colorHex,
      batteryBudget: `$${(Math.random() * 20 + 5).toFixed(2)} / $50 Daily Cap`,
      tokensProcessed: `${Math.floor(Math.random() * 800 + 200)}k tokens`,
      cryptoSignature: `Ed25519: 0x${Math.random().toString(16).slice(2, 8)}...${Math.random().toString(16).slice(2, 6)}`,
      coordinates: `Lane ${(newIndex % 3) + 1} • Sector ${String.fromCharCode(65 + (newIndex % 4))}-${newIndex}`,
      description: 'Newly synthesized autonomous AI agent deployed directly from the central gateway foundry to assist running swarm tasks.',
    };

    setVehicles((prev) => [newAgent, ...prev]);
    setDeployedCount(newIndex);
    setLockedVehicle(newAgent);
    setLastEventToast(`🚀 Synthesized & Launched ${newAgent.name} onto Highway!`);

    runtimeRef.current.spawnQueue.push({
      id: newAgent.id,
      color: colorHex,
    });
  }, [deployedCount]);

  // Trigger Security Intercept / Prompt Injection Simulation
  const handleTriggerSecurityProbe = useCallback(() => {
    setLastEventToast('🚨 PROMPT INJECTION DETECTED! Intercepting Vehicle at Toll Gate...');
    setIsGateArmed(true);
    setVehicles((prev) =>
      prev.map((v, i) =>
        i === 0
          ? {
              ...v,
              status: 'INTERCEPTED',
              task: 'BLOCKED: Attempted key exfiltration via prompt injection',
              latency: 'PAUSED (0ms)',
            }
          : v
      )
    );
  }, []);

  // Three.js Master Setup
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animId: number;
    const isDark = theme === 'dark';

    // 1. SCENE & CAMERA
    const scene = new THREE.Scene();
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 700;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 19, 23);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // Master World Group for Rotation & Parallax
    const worldGroup = new THREE.Group();
    scene.add(worldGroup);

    // 2. LIGHTING
    const ambientLight = new THREE.AmbientLight(0xffffff, isDark ? 0.9 : 1.4);
    scene.add(ambientLight);

    const keySun = new THREE.DirectionalLight(0xffedd5, isDark ? 2.5 : 3.0);
    keySun.position.set(15, 30, 20);
    keySun.castShadow = true;
    keySun.shadow.mapSize.width = 1024;
    keySun.shadow.mapSize.height = 1024;
    worldGroup.add(keySun);

    // Cyber Neon Accent Lights
    const amberLight = new THREE.PointLight(0xfbbf24, 3, 25);
    amberLight.position.set(0, 8, 0);
    worldGroup.add(amberLight);

    const cyanLight = new THREE.PointLight(0x38bdf8, 2.5, 30);
    cyanLight.position.set(-12, 6, -8);
    worldGroup.add(cyanLight);

    // 3. CYBERNETIC HIGHWAY GRID & PLATFORM
    // Base platform
    const platformGeo = new THREE.CylinderGeometry(15, 16.5, 0.6, 64);
    const platformMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x070b16 : 0x0c1326,
      roughness: 0.35,
      metalness: 0.85,
    });
    const platform = new THREE.Mesh(platformGeo, platformMat);
    platform.position.y = -0.3;
    platform.receiveShadow = true;
    worldGroup.add(platform);

    // Circuit Ground Grid Lines
    const gridHelper = new THREE.PolarGridHelper(14.8, 8, 8, 64, 0xfbbf24, 0x1e293b);
    gridHelper.position.y = 0.02;
    worldGroup.add(gridHelper);

    // 4. MULTI-LANE HIGHWAY TRACKS (Glowing Circuit Asphalt)
    const lanes = [
      { radius: 6.2, width: 1.4, color: 0xfbbf24, name: 'Inner Speed Lane' },
      { radius: 8.6, width: 1.6, color: 0x38bdf8, name: 'Main Sentry Lane' },
      { radius: 11.2, width: 1.8, color: 0x34d399, name: 'Heavy Escrow Lane' },
    ];

    lanes.forEach((lane) => {
      // Highway Asphalt Ring
      const ringGeo = new THREE.RingGeometry(lane.radius - lane.width / 2, lane.radius + lane.width / 2, 80);
      const ringMat = new THREE.MeshStandardMaterial({
        color: isDark ? 0x0f172a : 0x1e293b,
        roughness: 0.7,
        metalness: 0.4,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.03;
      ring.receiveShadow = true;
      worldGroup.add(ring);

      // Glowing Neon Lane Edge Dividers
      const innerEdgeGeo = new THREE.TorusGeometry(lane.radius - lane.width / 2, 0.035, 12, 100);
      const outerEdgeGeo = new THREE.TorusGeometry(lane.radius + lane.width / 2, 0.035, 12, 100);
      const edgeMat = new THREE.MeshBasicMaterial({
        color: lane.color,
        transparent: true,
        opacity: isDark ? 0.8 : 0.6,
      });

      const innerEdge = new THREE.Mesh(innerEdgeGeo, edgeMat);
      innerEdge.rotation.x = Math.PI / 2;
      innerEdge.position.y = 0.06;
      worldGroup.add(innerEdge);

      const outerEdge = new THREE.Mesh(outerEdgeGeo, edgeMat);
      outerEdge.rotation.x = Math.PI / 2;
      outerEdge.position.y = 0.06;
      worldGroup.add(outerEdge);
    });

    // Elevated Highway Overpass Ramp
    const rampCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-8, 0.05, 3),
      new THREE.Vector3(-4, 1.8, 6),
      new THREE.Vector3(4, 2.4, 4),
      new THREE.Vector3(8, 0.05, -2),
    ]);
    const rampGeo = new THREE.TubeGeometry(rampCurve, 40, 0.45, 12, false);
    const rampMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.7,
      roughness: 0.3,
    });
    const rampMesh = new THREE.Mesh(rampGeo, rampMat);
    worldGroup.add(rampMesh);

    // Ramp Neon Railing
    const rampGlowMat = new THREE.MeshBasicMaterial({ color: 0xa855f7 });
    const rampGlowTube = new THREE.Mesh(
      new THREE.TubeGeometry(rampCurve, 40, 0.05, 8, false),
      rampGlowMat
    );
    rampGlowTube.position.y = 0.25;
    worldGroup.add(rampGlowTube);

    // 5. CENTRAL AGENT FOUNDRY & GATEWAY DISPATCH TOWER (Where agents are born & deployed!)
    const foundryGroup = new THREE.Group();
    worldGroup.add(foundryGroup);

    // Tower Base (Hexagonal Core)
    const towerBaseGeo = new THREE.CylinderGeometry(2.4, 2.9, 2.2, 6);
    const towerBaseMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x090d1f : 0x13192f,
      metalness: 0.9,
      roughness: 0.2,
    });
    const towerBase = new THREE.Mesh(towerBaseGeo, towerBaseMat);
    towerBase.position.y = 1.1;
    foundryGroup.add(towerBase);

    // Middle Glass Assembly Bay
    const glassBayGeo = new THREE.CylinderGeometry(1.8, 2.1, 2.5, 32);
    const glassBayMat = new THREE.MeshPhysicalMaterial({
      color: 0xfbbf24,
      transmission: 0.7,
      thickness: 1.2,
      roughness: 0.1,
      metalness: 0.2,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.4,
    });
    const glassBay = new THREE.Mesh(glassBayGeo, glassBayMat);
    glassBay.position.y = 3.2;
    foundryGroup.add(glassBay);

    // Internal Holographic Agent Spinning in Assembly Chamber
    const nascentAgentGeo = new THREE.OctahedronGeometry(0.85, 0);
    const nascentAgentMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      wireframe: true,
      emissive: 0xf59e0b,
      emissiveIntensity: 1.5,
    });
    const nascentAgent = new THREE.Mesh(nascentAgentGeo, nascentAgentMat);
    nascentAgent.position.y = 3.2;
    foundryGroup.add(nascentAgent);

    // Spire & Dish
    const spireGeo = new THREE.CylinderGeometry(0.08, 0.4, 3.2, 16);
    const spireMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      metalness: 0.9,
      roughness: 0.1,
    });
    const spire = new THREE.Mesh(spireGeo, spireMat);
    spire.position.y = 5.8;
    foundryGroup.add(spire);

    // Holographic Orbiting Radar Ring on Foundry
    const towerRingGeo = new THREE.TorusGeometry(3.2, 0.05, 12, 64);
    const towerRingMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      transparent: true,
      opacity: 0.7,
    });
    const towerRing = new THREE.Mesh(towerRingGeo, towerRingMat);
    towerRing.position.y = 3.2;
    towerRing.rotation.x = Math.PI / 2;
    foundryGroup.add(towerRing);

    // 6. ZERO-TRUST SECURITY GATE / TOLL INTERCEPTOR (Arch over Highway)
    const gateArchGroup = new THREE.Group();
    gateArchGroup.position.set(0, 0, 8.6); // Spans across the main sentry lane
    worldGroup.add(gateArchGroup);

    // Left & Right Pillars
    const pillarGeo = new THREE.BoxGeometry(0.5, 3.4, 0.5);
    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.8,
      roughness: 0.2,
    });

    const leftPillar = new THREE.Mesh(pillarGeo, pillarMat);
    leftPillar.position.set(-2.0, 1.7, 0);
    gateArchGroup.add(leftPillar);

    const rightPillar = new THREE.Mesh(pillarGeo, pillarMat);
    rightPillar.position.set(2.0, 1.7, 0);
    gateArchGroup.add(rightPillar);

    // Overhead Scanner Bar
    const crossBarGeo = new THREE.BoxGeometry(4.5, 0.5, 0.8);
    const crossBarMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.9,
      roughness: 0.1,
    });
    const crossBar = new THREE.Mesh(crossBarGeo, crossBarMat);
    crossBar.position.set(0, 3.4, 0);
    gateArchGroup.add(crossBar);

    // Scanner Laser Curtain (Vertical Hologram)
    const laserPlaneGeo = new THREE.PlaneGeometry(3.6, 3.0);
    const laserPlaneMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
    });
    const laserCurtain = new THREE.Mesh(laserPlaneGeo, laserPlaneMat);
    laserCurtain.position.set(0, 1.6, 0);
    gateArchGroup.add(laserCurtain);

    // 7. BUILD HIGH-TECH AUTONOMOUS AI AGENT VEHICLES
    // Helper to create an aerodynamic futuristic AI Car Mesh
    interface AgentVehicle3D {
      group: THREE.Group;
      data: AgentVehicleDetail;
      laneRadius: number;
      speed: number;
      angle: number;
      chassisMesh: THREE.Mesh;
      wheels: THREE.Mesh[];
      headlights: THREE.SpotLight[];
      trailParticles: THREE.Points;
      isIntercepted: boolean;
      yOffset: number;
    }

    const agentCars: AgentVehicle3D[] = [];
    const interactiveMeshes: { mesh: THREE.Object3D; data: AgentVehicleDetail }[] = [];

    const createAgentCar = (detail: AgentVehicleDetail, laneIdx: number, initialAngle: number): AgentVehicle3D => {
      const carGroup = new THREE.Group();

      const hexColor = detail.colorHex;

      // 1. Sleek Aerodynamic Cyber Chassis (Beveled main body)
      const chassisGeo = new THREE.BoxGeometry(1.4, 0.42, 2.4);
      const chassisMat = new THREE.MeshStandardMaterial({
        color: hexColor,
        metalness: 0.85,
        roughness: 0.15,
        envMapIntensity: 1.5,
      });
      const chassis = new THREE.Mesh(chassisGeo, chassisMat);
      chassis.position.y = 0.38;
      chassis.castShadow = true;
      carGroup.add(chassis);

      // 2. Cyber Glass Cockpit / Lidar Processing Dome
      const cabinGeo = new THREE.BoxGeometry(1.0, 0.38, 1.2);
      const cabinMat = new THREE.MeshPhysicalMaterial({
        color: isDark ? 0x030712 : 0x0f172a,
        transmission: 0.4,
        roughness: 0.1,
        metalness: 0.9,
      });
      const cabin = new THREE.Mesh(cabinGeo, cabinMat);
      cabin.position.set(0, 0.68, -0.15);
      carGroup.add(cabin);

      // 3. Rotating Lidar Dome / Sensor Sensor on Roof
      const lidarGeo = new THREE.CylinderGeometry(0.2, 0.22, 0.18, 16);
      const lidarMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: hexColor,
        emissiveIntensity: 1.2,
      });
      const lidar = new THREE.Mesh(lidarGeo, lidarMat);
      lidar.position.set(0, 0.95, -0.15);
      carGroup.add(lidar);

      // 4. Four Futuristic Glowing Cyber Wheels / Hover Pads
      const wheelGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.22, 24);
      const wheelMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        metalness: 0.95,
        roughness: 0.1,
        emissive: hexColor,
        emissiveIntensity: 0.3,
      });

      const wheelPositions = [
        [-0.72, 0.32, 0.75], // Front Left
        [0.72, 0.32, 0.75],  // Front Right
        [-0.72, 0.32, -0.75], // Rear Left
        [0.72, 0.32, -0.75],  // Rear Right
      ];

      const wheels: THREE.Mesh[] = [];
      wheelPositions.forEach(([wx, wy, wz]) => {
        const wMesh = new THREE.Mesh(wheelGeo, wheelMat);
        wMesh.rotation.z = Math.PI / 2;
        wMesh.position.set(wx, wy, wz);
        wMesh.castShadow = true;
        carGroup.add(wMesh);
        wheels.push(wMesh);
      });

      // 5. Twin Forward Laser Headlights
      const leftLight = new THREE.SpotLight(0xffffff, 2.0, 7, Math.PI / 6, 0.3);
      leftLight.position.set(-0.4, 0.38, 1.2);
      leftLight.target.position.set(-0.4, 0, 5);
      carGroup.add(leftLight);
      carGroup.add(leftLight.target);

      const rightLight = new THREE.SpotLight(0xffffff, 2.0, 7, Math.PI / 6, 0.3);
      rightLight.position.set(0.4, 0.38, 1.2);
      rightLight.target.position.set(0.4, 0, 5);
      carGroup.add(rightLight);
      carGroup.add(rightLight.target);

      // 6. Neon Underglow Strip
      const underglowGeo = new THREE.PlaneGeometry(1.2, 2.0);
      const underglowMat = new THREE.MeshBasicMaterial({
        color: hexColor,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide,
      });
      const underglow = new THREE.Mesh(underglowGeo, underglowMat);
      underglow.rotation.x = Math.PI / 2;
      underglow.position.y = 0.08;
      carGroup.add(underglow);

      // 7. Exhaust Energy Trail Particles
      const trailCount = 20;
      const trailPos = new Float32Array(trailCount * 3);
      for (let t = 0; t < trailCount * 3; t += 3) {
        trailPos[t] = (Math.random() - 0.5) * 0.4;
        trailPos[t + 1] = 0.3 + Math.random() * 0.2;
        trailPos[t + 2] = -1.2 - Math.random() * 1.5;
      }
      const trailGeo = new THREE.BufferGeometry();
      trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPos, 3));
      const trailMat = new THREE.PointsMaterial({
        color: hexColor,
        size: 0.12,
        transparent: true,
        opacity: 0.8,
      });
      const trailPoints = new THREE.Points(trailGeo, trailMat);
      carGroup.add(trailPoints);

      worldGroup.add(carGroup);

      // Register interactive hit targets
      interactiveMeshes.push({ mesh: chassis, data: detail });
      interactiveMeshes.push({ mesh: cabin, data: detail });

      const laneRadius = lanes[laneIdx % lanes.length].radius;
      const baseSpeed = 0.012 + (laneIdx === 0 ? 0.005 : laneIdx === 1 ? 0.003 : 0.0015);

      return {
        group: carGroup,
        data: detail,
        laneRadius: laneRadius,
        speed: baseSpeed,
        angle: initialAngle,
        chassisMesh: chassis,
        wheels: wheels,
        headlights: [leftLight, rightLight],
        trailParticles: trailPoints,
        isIntercepted: detail.status === 'INTERCEPTED',
        yOffset: 0.05,
      };
    };

    // Instantiate initial 5 cars on the circuit
    INITIAL_AGENT_VEHICLES.forEach((veh, idx) => {
      const laneIndex = idx % 3;
      const angle = (idx * Math.PI * 2) / INITIAL_AGENT_VEHICLES.length;
      agentCars.push(createAgentCar(veh, laneIndex, angle));
    });

    // 8. INTER-AGENT DATA PACKET BEAMS (Collaborative Task Pulses)
    const beamCount = 3;
    const laserLines: THREE.Line[] = [];
    for (let b = 0; b < beamCount; b++) {
      const beamGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, 0),
      ]);
      const beamMat = new THREE.LineBasicMaterial({
        color: 0xfbbf24,
        transparent: true,
        opacity: 0.6,
      });
      const beamLine = new THREE.Line(beamGeo, beamMat);
      worldGroup.add(beamLine);
      laserLines.push(beamLine);
    }

    // 9. RAYCASTING FOR HOVER INTERACTION
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-999, -999);
    const tempProjVector = new THREE.Vector3();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouse.x = x;
      mouse.y = y;

      runtimeRef.current.mouseX = x;
      runtimeRef.current.mouseY = y;
      runtimeRef.current.targetRotY = x * 0.45;
      runtimeRef.current.targetRotX = -y * 0.35;
    };

    const handleMouseLeave = () => {
      mouse.x = -999;
      mouse.y = -999;
      setHoveredVehicle(null);
      setHudScreenPos(null);
      runtimeRef.current.hoveredId = null;
    };

    const handleClick = () => {
      if (runtimeRef.current.hoveredId) {
        const found = vehicles.find((v) => v.id === runtimeRef.current.hoveredId);
        if (found) {
          setLockedVehicle(found);
          setLastEventToast(`🎯 Tracking & Inspected ${found.name}`);
        }
      }
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('click', handleClick);

    // Scroll Listener for parallax
    const handleScroll = () => {
      runtimeRef.current.scrollY = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries[0]) return;
      const { width: newW, height: newH } = entries[0].contentRect;
      if (newW > 0 && newH > 0) {
        camera.aspect = newW / newH;
        camera.updateProjectionMatrix();
        renderer.setSize(newW, newH);
      }
    });
    resizeObserver.observe(container);

    // 10. ANIMATION RENDER LOOP
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      const scrollY = runtimeRef.current.scrollY;
      const scrollFactor = Math.min(scrollY / 900, 2.0);

      // Check spawn queue
      if (runtimeRef.current.spawnQueue.length > 0) {
        const spawn = runtimeRef.current.spawnQueue.shift()!;
        const matched = vehicles.find((v) => v.id === spawn.id);
        if (matched) {
          const newCar = createAgentCar(matched, agentCars.length % 3, -Math.PI / 2);
          agentCars.push(newCar);
        }
      }

      // Rotate Foundry elements
      glassBay.rotation.y += 0.005;
      nascentAgent.rotation.x += 0.02;
      nascentAgent.rotation.y += 0.025;
      towerRing.rotation.z += 0.015;

      // Gate Laser Scanner Pulse
      if (runtimeRef.current.isGateArmed) {
        laserCurtain.visible = true;
        (laserCurtain.material as THREE.MeshBasicMaterial).opacity =
          0.3 + Math.sin(elapsedTime * 4) * 0.2;
        (laserCurtain.material as THREE.MeshBasicMaterial).color.setHex(0xef4444);
      } else {
        laserCurtain.visible = true;
        (laserCurtain.material as THREE.MeshBasicMaterial).opacity = 0.2;
        (laserCurtain.material as THREE.MeshBasicMaterial).color.setHex(0x10b981);
      }

      // Drive Autonomous Agent Cars Along Their Circuit Lanes!
      const currentSpeedMult = runtimeRef.current.speedMultiplier;

      agentCars.forEach((car, i) => {
        // Check if car is near Toll Gate (angle around 0 rad / z=8.6)
        const isNearTollGate = Math.abs(car.angle % (Math.PI * 2)) < 0.25 || Math.abs((car.angle % (Math.PI * 2)) - Math.PI * 2) < 0.25;

        // If gate is armed and this is the designated intercepted car, halt!
        if (car.data.status === 'INTERCEPTED' && runtimeRef.current.isGateArmed) {
          // Slow to stop at gate
          car.speed = THREE.MathUtils.lerp(car.speed, 0, 0.05);
        } else {
          // Accelerate normally with speed multiplier
          const targetSpeed = (0.012 + (i % 3) * 0.003) * currentSpeedMult;
          car.speed = THREE.MathUtils.lerp(car.speed, targetSpeed, 0.08);
        }

        car.angle += car.speed;

        // Position on circle
        const x = Math.sin(car.angle) * car.laneRadius;
        const z = Math.cos(car.angle) * car.laneRadius;

        car.group.position.set(x, car.yOffset, z);

        // Orient car tangentially to circle (heading forward)
        car.group.rotation.y = car.angle + Math.PI / 2;

        // Spin Wheels
        car.wheels.forEach((w) => {
          w.rotation.x += car.speed * 25;
        });

        // Slight suspension bounce
        car.chassisMesh.position.y = 0.38 + Math.sin(elapsedTime * 12 + i) * 0.02;

        // Update Laser Beams between adjacent cars
        if (laserLines[i % laserLines.length] && agentCars[(i + 1) % agentCars.length]) {
          const nextCar = agentCars[(i + 1) % agentCars.length];
          const line = laserLines[i % laserLines.length];
          const pos = line.geometry.attributes.position as THREE.BufferAttribute;
          pos.setXYZ(0, x, 0.8, z);
          pos.setXYZ(1, nextCar.group.position.x, 0.8, nextCar.group.position.z);
          pos.needsUpdate = true;
        }
      });

      // Camera Angle Mode Logic
      const viewMode = runtimeRef.current.viewAngle;
      if (viewMode === 'DRONE') {
        // High 90-degree tactical top-down view
        camera.position.lerp(new THREE.Vector3(0, 32, 0.1), 0.05);
        camera.lookAt(0, 0, 0);
      } else if (viewMode === 'CHASE' && agentCars.length > 0) {
        // Follow the lead car
        const lead = agentCars[0];
        const chasePos = new THREE.Vector3(
          lead.group.position.x * 1.35,
          lead.group.position.y + 4.5,
          lead.group.position.z * 1.35
        );
        camera.position.lerp(chasePos, 0.04);
        camera.lookAt(lead.group.position);
      } else {
        // Standard Isometric Orbit with mouse tilt & scroll parallax
        const targetRotY = runtimeRef.current.targetRotY + scrollFactor * 0.35;
        const targetRotX = runtimeRef.current.targetRotX - scrollFactor * 0.25;

        worldGroup.rotation.y += (targetRotY - worldGroup.rotation.y) * 0.05;
        worldGroup.rotation.x += (targetRotX - worldGroup.rotation.x) * 0.05;

        const defaultCamPos = new THREE.Vector3(0, 19 + scrollFactor * 3.5, 23 + scrollFactor * 5);
        camera.position.lerp(defaultCamPos, 0.05);
        camera.lookAt(0, 1.5, 0);
      }

      // RAYCASTING: Detect Hovered Agent Car
      raycaster.setFromCamera(mouse, camera);
      const meshesToTest = interactiveMeshes.map((im) => im.mesh);
      const intersects = raycaster.intersectObjects(meshesToTest, true);

      let hitData: AgentVehicleDetail | null = null;
      let targetScreenX = 0;
      let targetScreenY = 0;

      if (intersects.length > 0) {
        const hitMesh = intersects[0].object;
        const found = interactiveMeshes.find((im) => im.mesh === hitMesh);
        if (found) {
          hitData = found.data;
          runtimeRef.current.hoveredId = found.data.id;

          // Project 3D Coordinates to 2D Screen
          found.mesh.getWorldPosition(tempProjVector);
          tempProjVector.project(camera);

          const currentW = container.clientWidth || 800;
          const currentH = container.clientHeight || 700;

          targetScreenX = ((tempProjVector.x + 1) * currentW) / 2;
          targetScreenY = ((-tempProjVector.y + 1) * currentH) / 2;
        }
      } else {
        runtimeRef.current.hoveredId = null;
      }

      if (hitData) {
        setHoveredVehicle(hitData);
        setHudScreenPos({ x: targetScreenX, y: targetScreenY });
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('click', handleClick);
      window.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      scene.clear();
    };
  }, [theme, vehicles]);

  const activeInspector = hoveredVehicle || lockedVehicle;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[640px] sm:h-[740px] lg:h-[820px] flex items-center justify-center rounded-3xl overflow-hidden border border-[#33302b] bg-gradient-to-b from-[#0c0b0a] via-[#141210] to-[#080706] backdrop-blur-2xl shadow-2xl group select-none"
    >
      {/* 3D Scene Subtle Ground Ambient Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/5 via-transparent to-transparent pointer-events-none" />

      {/* TOP COMMAND DECK BAR */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Fleet Architecture Identity Badge */}
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#181715]/90 border border-[#33302b] backdrop-blur-xl text-xs font-mono text-[#f59e0b] pointer-events-auto shadow-xl">
          <Car className="w-4 h-4 text-[#f59e0b]" />
          <span className="font-bold tracking-wider text-[#f5f3ef]">AUTONOMOUS AI AGENT FLEET EXPRESSWAY</span>
          <span className="text-[#5c5850]">|</span>
          <span className="text-emerald-400 font-bold">{deployedCount} ACTIVE AGENT CRUISERS</span>
        </div>

        {/* Fleet Simulation Controls */}
        <div className="flex flex-wrap items-center gap-2 pointer-events-auto">
          {/* Deploy New Agent Button */}
          <button
            onClick={handleDeployNewAgent}
            className="px-3.5 py-1.5 rounded-xl bg-[#d97706] hover:bg-[#b45309] text-white font-bold text-xs font-mono shadow-xs flex items-center gap-1.5 transition-all hover:scale-105 cursor-pointer"
            title="Synthesize and Deploy a new Autonomous AI Agent Vehicle"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Deploy New Agent</span>
          </button>

          {/* Camera View Selector */}
          <div className="flex items-center p-1 rounded-xl bg-[#181715]/90 border border-[#33302b] backdrop-blur-xl">
            {(['ISOMETRIC', 'DRONE', 'CHASE'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewAngle(mode)}
                className={`px-2 py-1 rounded-lg text-[10px] font-mono transition-all cursor-pointer ${
                  viewAngle === mode
                    ? 'bg-[#f5f3ef] text-[#181715] font-bold'
                    : 'text-[#b8b4aa] hover:text-[#f5f3ef]'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Speed Multiplier Toggle */}
          <button
            onClick={() => setSpeedMultiplier((prev) => (prev === 1 ? 2 : prev === 2 ? 3 : 1))}
            className="px-2.5 py-1.5 rounded-xl bg-[#181715]/90 border border-[#33302b] hover:border-amber-500/40 text-[#f59e0b] text-xs font-mono flex items-center gap-1 cursor-pointer"
            title="Accelerate Agent Swarm Speed"
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>{speedMultiplier}x Speed</span>
          </button>

          {/* Security Gate Simulation Probe */}
          <button
            onClick={handleTriggerSecurityProbe}
            className="px-3 py-1.5 rounded-xl border border-red-500/40 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-mono flex items-center gap-1.5 cursor-pointer"
            title="Simulate incoming malicious prompt injection & trigger escrow toll gate"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Simulate Attack</span>
          </button>
        </div>
      </div>

      {/* EVENT TOAST NOTIFICATION */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <div className="px-4 py-1.5 rounded-full bg-[#181715]/90 border border-amber-500/30 text-[11px] font-mono text-[#f5f3ef] shadow-2xl backdrop-blur-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{lastEventToast}</span>
        </div>
      </div>

      {/* DYNAMIC FLOATING HOLOGRAPHIC DETAIL CARD (Tracks Hovered 3D Agent Car) */}
      {hoveredVehicle && hudScreenPos && (
        <div
          style={{
            left: `${Math.min(Math.max(hudScreenPos.x + 20, 20), (containerRef.current?.clientWidth || 800) - 350)}px`,
            top: `${Math.min(Math.max(hudScreenPos.y - 100, 70), (containerRef.current?.clientHeight || 700) - 290)}px`,
          }}
          className="absolute z-30 pointer-events-auto w-84 p-4 rounded-2xl bg-[#181715]/95 border border-[#33302b] backdrop-blur-2xl shadow-2xl text-[#f5f3ef] font-mono transition-all animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#33302b] text-[11px]">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full animate-ping"
                style={{ backgroundColor: hoveredVehicle.color }}
              />
              <span className="font-bold text-[#f59e0b]">{hoveredVehicle.code}</span>
            </div>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                hoveredVehicle.status === 'INTERCEPTED'
                  ? 'bg-red-500/20 text-red-400 border-red-500/40'
                  : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
              }`}
            >
              {hoveredVehicle.status}
            </span>
          </div>

          <h4 className="text-xs font-bold text-white mb-1">{hoveredVehicle.name}</h4>
          <p className="text-[10px] text-[#b8b4aa] font-sans leading-snug mb-3">
            Mission: <strong className="font-semibold text-white">{hoveredVehicle.task}</strong>
          </p>

          {/* Real-time Detailed Vehicle Telemetry */}
          <div className="grid grid-cols-2 gap-2 text-[10px] p-2.5 rounded-xl bg-[#0c0b0a]/80 border border-[#33302b] mb-3">
            <div>
              <span className="text-[#878278] block">Agent Model:</span>
              <span className="text-white font-bold truncate block">{hoveredVehicle.model}</span>
            </div>
            <div>
              <span className="text-[#878278] block">Telemetry Speed:</span>
              <span className="text-emerald-400 font-bold">{hoveredVehicle.speed}</span>
            </div>
            <div>
              <span className="text-[#878278] block">AST Latency:</span>
              <span className="text-[#f59e0b] font-bold">{hoveredVehicle.latency}</span>
            </div>
            <div>
              <span className="text-[#878278] block">Daily Budget Cap:</span>
              <span className="text-sky-300 font-bold">{hoveredVehicle.batteryBudget}</span>
            </div>
          </div>

          {/* Cryptographic Proof & Location */}
          <div className="text-[9px] text-[#878278] flex items-center justify-between pb-2 mb-2 border-b border-[#33302b]">
            <span>Location: {hoveredVehicle.coordinates}</span>
            <span className="text-emerald-400 font-mono truncate max-w-[120px]">
              {hoveredVehicle.cryptoSignature}
            </span>
          </div>

          {/* Interactive Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setVehicles((prev) =>
                  prev.map((v) =>
                    v.id === hoveredVehicle.id
                      ? {
                          ...v,
                          status: v.status === 'INTERCEPTED' ? 'DRIVING' : 'INTERCEPTED',
                        }
                      : v
                  )
                );
              }}
              className="flex-1 py-1.5 px-2 rounded-lg bg-[#d97706] hover:bg-[#b45309] text-white font-bold text-[10px] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              {hoveredVehicle.status === 'INTERCEPTED' ? (
                <>
                  <Play className="w-3 h-3 fill-white" />
                  <span>Release Escrow</span>
                </>
              ) : (
                <>
                  <Pause className="w-3 h-3 fill-white" />
                  <span>Halt at Toll Gate</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('sandbox-demo');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="py-1.5 px-2.5 rounded-lg border border-[#33302b] hover:border-amber-500/40 text-[#b8b4aa] hover:text-white text-[10px] flex items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              <Eye className="w-3 h-3" />
              <span>Sandbox</span>
            </button>
          </div>
        </div>
      )}

      {/* BOTTOM LEFT: FLEET REGISTRY & LIVE VEHICLE INSPECTOR */}
      <div className="absolute bottom-4 left-4 z-20 flex flex-col gap-2 max-w-md pointer-events-auto">
        {/* Agent Vehicle Selector Pills */}
        <div className="flex flex-wrap items-center gap-1 p-1.5 rounded-2xl bg-[#181715]/85 border border-[#33302b] backdrop-blur-xl">
          {vehicles.slice(0, 6).map((veh) => {
            const isSelected = activeInspector.id === veh.id;
            return (
              <button
                key={veh.id}
                onClick={() => setLockedVehicle(veh)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all cursor-pointer flex items-center gap-1 ${
                  isSelected
                    ? 'bg-[#f5f3ef] text-[#181715] font-bold shadow-xs scale-105'
                    : 'text-[#878278] hover:text-[#f5f3ef] hover:bg-[#211f1c]'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: veh.color }} />
                <span>{veh.code}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Vehicle Detail Card */}
        <div className="p-3.5 rounded-2xl bg-[#181715]/90 border border-[#33302b] backdrop-blur-2xl shadow-2xl text-xs space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: activeInspector.color }} />
              <span className="font-bold text-white font-mono">{activeInspector.name}</span>
            </div>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                activeInspector.status === 'INTERCEPTED'
                  ? 'bg-red-500/15 text-red-400 border-red-500/40'
                  : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40'
              }`}
            >
              {activeInspector.status}
            </span>
          </div>

          <p className="text-[11px] text-[#b8b4aa] font-sans leading-relaxed">
            {activeInspector.description}
          </p>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#33302b] font-mono text-[10px]">
            <div>
              <span className="text-[#878278] block">Telemetry:</span>
              <span className="text-emerald-400 font-bold">{activeInspector.latency}</span>
            </div>
            <div>
              <span className="text-[#878278] block">Tokens Read:</span>
              <span className="text-[#f59e0b] font-bold">{activeInspector.tokensProcessed}</span>
            </div>
            <div>
              <span className="text-[#878278] block">Identity:</span>
              <span className="text-sky-300 font-bold truncate block">{activeInspector.model.split('/')[0]}</span>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM RIGHT: LIVE TELEMETRY RADAR & FLEET METRICS */}
      <div className="absolute bottom-4 right-4 z-20 hidden md:flex flex-col items-end gap-2 pointer-events-auto">
        {/* Real-time Telemetry Stats Pill */}
        <div className="p-3 rounded-2xl bg-[#181715]/85 border border-[#33302b] backdrop-blur-xl font-mono text-xs text-right space-y-1 shadow-xl">
          <div className="flex items-center justify-end gap-2 text-slate-200">
            <Radio className="w-3.5 h-3.5 text-[#f59e0b] animate-pulse" />
            <span className="text-[#f59e0b] font-bold">1,840 AGENT TRANSACTIONS / SEC</span>
          </div>
          <div className="text-[10px] text-[#878278]">
            Toll Gate Zero-Trust Status: <span className="text-emerald-400 font-bold">ACTIVE & DEFENDING</span>
          </div>
        </div>

        {/* Quick Launch Buttons Dock */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSubscriptionModalOpen(true, 'PRO_MONTHLY')}
            className="px-3.5 py-2 rounded-xl border border-amber-500/40 hover:border-amber-500 bg-amber-500/10 hover:bg-amber-500/20 text-[#f59e0b] font-bold text-xs font-mono flex items-center gap-1.5 transition-all backdrop-blur-md cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pro Fleet ($199/mo)</span>
          </button>

          <button
            onClick={() => {
              const el = document.getElementById('sandbox-demo');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-3.5 py-2 rounded-xl bg-[#211f1c] hover:bg-[#282622] text-[#f5f3ef] border border-[#33302b] text-xs font-mono flex items-center gap-1.5 transition-all backdrop-blur-md cursor-pointer"
          >
            <Play className="w-3 h-3 text-[#f59e0b] fill-[#f59e0b]" />
            <span>Interactive Sandbox</span>
          </button>
        </div>
      </div>

      {/* CENTER INTERACTION INSTRUCTION HINT */}
      <div className="absolute top-2/3 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-40 transition-opacity duration-300 text-slate-400 text-[10px] font-mono uppercase tracking-widest text-center">
        Hover Any AI Agent Vehicle to Inspect Telemetry • Drag to Orbit Highway
      </div>
    </div>
  );
};
