import NetworkScene from "@/components/NeuralNetwork";

export default function Home() {
  return (
    <main className="page">
      <div className="header">
        <div>
          <div className="eyebrow">THREE.JS · NEURAL NETWORK</div>
          <h1>Network Architecture</h1>
          <p>2 → 16 → 8 → 1 fully-connected network</p>
        </div>
        <div className="legend">
          <span><i className="positive" /> positive weight</span>
          <span><i className="negative" /> negative weight</span>
          <span><i className="node" /> neuron</span>
        </div>
      </div>

      <section className="canvasWrap">
        <NetworkScene />
      </section>

      <div className="hint">
        Drag to rotate · Scroll to zoom · Hover a connection to inspect its weight
      </div>
    </main>
  );
}
