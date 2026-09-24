"use client";
import { Cylinder } from '@react-three/drei';
import { useMemo, useState } from "react";
import { Quaternion, Vector3 } from 'three';
import { connections } from "./types";

const Connection = ({ from_layer, to_layer, from_neuron, to_neuron, weight }: connections) => {
    const [hovered, setHovered] = useState(false);

    const intensity = Math.min(Math.abs(weight), 1);

    // Calculate position, length, and orientation using useMemo to optimize performance
    const { midpt, length, quaternion } = useMemo(() => {
        // Offset neurons centered vertically/horizontally if desired
        const start = new Vector3(from_layer * 3.5, from_neuron * 1.5, 0);
        const end = new Vector3(to_layer * 3.5, to_neuron * 1.5, 0);

        const midpt = new Vector3().addVectors(start, end).multiplyScalar(0.5);
        const direction = new Vector3().subVectors(end, start);
        const length = direction.length();

        // Orient default Y-aligned cylinder towards target direction
        const orientation = new Quaternion();
        const defaultAxis = new Vector3(1, 1, 0);
        orientation.setFromUnitVectors(defaultAxis, direction.clone().normalize());

        return { midpt, length, quaternion: orientation };
    }, [from_layer, to_layer, from_neuron, to_neuron]);

    const radius = 0.02 + intensity * 0.04 + (hovered ? 0.02 : 0);

    return (
        <Cylinder
        args={[radius, radius, length, 8]}
        position={midpt}
        quaternion={quaternion}
        onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
        >
        <meshStandardMaterial
            color={hovered ? "#0fff97" : weight >= 0 ? "#c022c5" : "#31e4ff"}
            transparent
            opacity={hovered ? 1 : 0.3 + intensity * 0.7}
            roughness={0.3}
        />
        </Cylinder>
  );
};

export default Connection;