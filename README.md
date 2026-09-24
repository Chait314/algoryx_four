# Neural Network Visualizer

An interactive 3D visualization of a neural network built with **Next.js, React Three Fiber, and Three.js**.

The project transforms a neural network's architecture and learned weights into an interactive 3D scene, allowing you to explore neurons, connections, layer structure, and individual weights visually.


##  Features

*  **3D Neural Network Visualization**

  * Visualize neurons and layers as a 3D network.
  * Supports arbitrary layer sizes from a JSON network definition.

*  **Weighted Connections**

  * Every connection represents a learned weight.
  * Positive and negative weights are visually differentiated.
  * Connection thickness changes when hovered.

*  **Interactive Neurons**

  * Click individual neurons to inspect them.
  * Selected neurons are highlighted and enlarged.
  * Displays the neuron's bias value.

*  **3D Camera Controls**

  * Rotate around the network.
  * Zoom in and out.
  * Pan across the scene.
  * Smooth camera damping using `OrbitControls`.

*  **Network Architecture**

  * Input, hidden, and output layers are positioned automatically.
  * Neuron spacing adapts to the number of neurons in each layer.

*  **GLB Export**

  * Export the visualized network as a `.glb` 3D model.
  * Exported geometry can be opened in Blender, Three.js, or other 3
