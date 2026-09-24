"use client";

import { Html, OrbitControls, Text } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";

    type Layer = {
    id: number;
    type: string;
    input_size: number;
    output_size: number;
    weights: number[][];
    biases: number[];
    };

    type ConnectionData = {
    from_layer: number;
    to_layer: number;
    from_neuron: number;
    to_neuron: number;
    weight: number;
    };

    type NetworkData = {
    layers: Layer[];
    connections: ConnectionData[];
    };

    type Point = {
    layer: number;
    neuron: number;
    position: THREE.Vector3;
    bias: number;
    };

    function makePositions(data: NetworkData): Point[] {
    const points: Point[] = [];

    const layerSpacing = 6.2;

    const inputSize = data.layers[0].input_size;

    const inputX = -(data.layers.length /2)*layerSpacing;
    const inputSpacing = Math.min(1.0, 7.5/Math.max(1, inputSize-1));

    const inputHeight = (inputSize-1)*inputSpacing;

    for(let n = 0; n < inputSize; n++){
        const y = inputHeight/2 - n*inputSpacing;

        points.push({
            layer: 0,
            neuron: n,
            position: new THREE.Vector3(
                inputX, y, 0
            ),
            bias: 0
        })
    }

    data.layers.forEach((layer, layerIndex) => {
        const x = (layerIndex - (data.layers.length - 1) / 2) * 6.2;
        const count = layer.output_size;

        const spacing = Math.min(1.0, 7.5 / Math.max(count - 1, 1));
        const totalHeight = (count - 1) * spacing;

        for (let n = 0; n < count; n++) {
        const y = totalHeight / 2 - n * spacing;

        points.push({
            layer: layer.id+1,
            neuron: n,
            position: new THREE.Vector3(x, y, 0),
            bias: layer.biases[n] ?? 0
        });
        }
    });

    return points;
    }

    function Connection({
        from,
        to,
        weight,
        hovered,
        onHover
        }: {
        from: THREE.Vector3;
        to: THREE.Vector3;
        weight: number;
        hovered: boolean;
        onHover: (value: boolean) => void;
        }) {
        const direction = useMemo(() => {
            return new THREE.Vector3().subVectors(to, from);
        }, [from, to]);

        const length = direction.length();

        const midpoint = useMemo(() => {
            return new THREE.Vector3()
            .addVectors(from, to)
            .multiplyScalar(0.5);
        }, [from, to]);

        const quaternion = useMemo(() => {
            const q = new THREE.Quaternion();

            q.setFromUnitVectors(
                new THREE.Vector3(0, 1, 0),
                direction.clone().normalize()
            );

            return q;
        }, [direction]);

        const opacity =
            hovered
            ? 1
            : 0.25 + Math.min(Math.abs(weight) / 3, 0.5);

        const radius = hovered ? 0.035 : 0.015;

        return (
            <mesh
            position={midpoint}
            quaternion={quaternion}
            onPointerOver={(e) => {
                e.stopPropagation();
                onHover(true);
            }}
            onPointerOut={(e) => {
                e.stopPropagation();
                onHover(false);
            }}
            >
            <cylinderGeometry
                args={[
                    radius,
                    radius,
                    length,
                8
                ]}
            />

            <meshBasicMaterial
                color={weight >= 0 ? "#15ff6b" : "#f1f50d"}
                transparent
                opacity={opacity}
            />
            </mesh>
        );
        }

    function Neuron({
    point,
    selected,
    onSelect
    }: {
    point: Point;
    selected: boolean;
    onSelect: (point: Point) => void;
    }) {
    const mesh = useRef<THREE.Mesh>(null);

    useFrame((_, delta) => {
        if (!mesh.current) return;

        const target = selected ? 1.35 : 1;
        mesh.current.scale.lerp(
        new THREE.Vector3(target, target, target),
        Math.min(delta * 10, 1)
        );
    });

    return (
        <mesh
        ref={mesh}
        position={point.position}
        onClick={(e) => {
            e.stopPropagation();
            onSelect(point);
        }}
        >
        <sphereGeometry args={[0.16, 24, 24]} />
        <meshStandardMaterial
            color={selected ? "#ff0f0f" : "#ff00ea"}
            emissive={selected ? "#38bdf8" : "#172033"}
            emissiveIntensity={selected ? 2.2 : 0.6}
            roughness={0.3}
            metalness={0.15}
        />
        </mesh>
    );
    }

function GLBExport(){
    const { scene } = useThree();
    const exportGLB = () => {
        const exporter = new GLTFExporter();
       // const {scene} = useThree();
        exporter.parse(
            scene, 
            (result)=>{
                const blob = new Blob(
                    [result as ArrayBuffer],
                    { type: "model/gltf-binary" }
                );
                const url = URL.createObjectURL(blob);

                const link = document.createElement('a');
                link.href = url;
                link.download = 'neural-network.glb';
                link.click();

                URL.revokeObjectURL(url);
            },

            (error)=> {
                console.log("glb export failed:", error);
            },
            {
                binary: true,
            }

        )
    }
    return (
        <Html>
        <button
        onClick={exportGLB}
        style={{
        position: "absolute",
        top: 100,
        right: 20,
        zIndex: 100,
        padding: "10px 16px",
        borderRadius: 8,
        background: "white",
        color: "black",
        cursor: "pointer",
        }}
    >
        Export GLB
    </button>
    </Html>
    )
}

    function Network({
    data,
    selected,
    setSelected
    }: {
    data: NetworkData;
    selected: Point | null;
    setSelected: (p: Point | null) => void;
    }) {
    const points = useMemo(() => makePositions(data), [data]);

    const pointMap = useMemo(() => {
        const map = new Map<string, Point>();
        points.forEach((p) => map.set(`${p.layer}-${p.neuron}`, p));
        return map;
    }, [points]);

    const [hoveredConnection, setHoveredConnection] = useState<number | null>(null);

    return (
        <>
        <ambientLight intensity={0.8} />
        <pointLight position={[0, 0, 8]} intensity={40} distance={30} />
        {data.connections.map((connection, index) => {
            const from = pointMap.get(
            `${connection.from_layer}-${connection.from_neuron}`
            );
            const to = pointMap.get(
            `${connection.to_layer}-${connection.to_neuron}`
            );

            if (!from || !to) return null;

            return (
            <Connection
                key={index}
                from={from.position}
                to={to.position}
                weight={connection.weight}
                hovered={hoveredConnection === index}
                onHover={(value) =>
                setHoveredConnection(value ? index : null)
                }
            />
            );
        })}

        {points.map((point) => (
            <Neuron
            key={`${point.layer}-${point.neuron}`}
            point={point}
            selected={
                selected?.layer === point.layer &&
                selected.neuron === point.neuron
            }
            onSelect={setSelected}
            />
        ))}

        {data.layers.map((layer, i) => {
            const x = (i - (data.layers.length - 1) / 2) * 6.2;
            const names = ["Input", "Hidden", "Hidden", "Output"];
            return (
            <Text
                key={layer.id}
                position={[x-3.5, -4.7, 0]}
                fontSize={0.28}
                color="#e0e4e9"
                anchorX="center"
            >
                {names[i] ?? `Layer ${i}`}
            </Text>
            );
        })}

        {selected && (
            <group position={[selected.position.x + 1, selected.position.y + 0.25, 2]}>
            <Text fontSize={0.22} color="#f8fafc" anchorX="center">
                {`neuron ${selected.neuron}`}
            </Text>
            <Text
                position={[0, -0.3, 0]}
                fontSize={0.17}
                color="#7dd3fc"
                anchorX="center"
            >   
                {`bias ${selected.bias.toFixed(3)}`}
            </Text>
            </group>
        )}
        </>
    );
    }

    function SceneContent() {
    const [data, setData] = useState<NetworkData | null>(null);
    const [selected, setSelected] = useState<Point | null>(null);

    useEffect(() => {
        fetch("network.json")
        .then((res) => res.json())
        .then((json: NetworkData) =>{ setData(json);console.log(json)})
        .catch(console.error);
    }, []);


    if (!data) return null;



    return (
        
        <Canvas
        camera={{ position: [0, 0, 20], fov: 60 }}
        dpr={[1, 3]}
        gl={{ antialias: true, alpha: true }}
        onPointerMissed={() => setSelected(null)}
        >
        <color attach="background" args={["#0004fa"]} />
        
        <Network
            data={data}
            selected={selected}
            setSelected={setSelected}
        />

        <OrbitControls
            enablePan
            enableDamping
            dampingFactor={0.08}
            minDistance={8}
            maxDistance={32}
            target={[0, 0, 0]}
        />
        <GLBExport/>
        <gridHelper
            args={[30, 30, "#44dbfd", "#8eb4ff"]}
            position={[0, -4.3, -2]}
            rotation={[0, 0, 0]}
        />
        </Canvas>
        
    );
    }

    export default function NetworkScene() {
    return <SceneContent />;
    }
