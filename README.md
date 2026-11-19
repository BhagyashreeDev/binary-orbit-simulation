# Binary Orbital Mechanics — Two-Body Gravitational Simulation

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-2563eb?style=for-the-badge&logo=github)](https://bhagyashreedev.github.io/binary-orbit-simulation/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge)](LICENSE)

An interactive, high-performance two-body orbital mechanics simulation built from scratch using pure **HTML5 Canvas**, **Vanilla JavaScript**, and the **Web Audio API**.

The project simulates the gravitational interaction between two celestial bodies—**Body B (Warm)** and **Body V (Cool)**—allowing users to explore orbital kinematics, momentum conservation, and escape trajectories in real time.

---

## 🌐 Live Demo

Experience the interactive simulation live in your web browser:  
👉 **[https://bhagyashreedev.github.io/binary-orbit-simulation/](https://bhagyashreedev.github.io/binary-orbit-simulation/)**

---

## 🌌 Overview

In astrophysics, the **Two-Body Problem** predicts the motion of two celestial objects that interact only through mutual gravitational attraction. 

This project brings those equations to life directly in your web browser with a sleek, minimalist telemetry interface and ambient harmonic audio:

* **Body B (Warm Core)**: A massive primary celestial body ($M = 1200$) radiating a warm, solar-thermal amber light.
* **Body V (Cool Companion)**: A lighter secondary body ($m = 500$) exhibiting a cool starlight-cyan luminescence.
* **Gravitational Tether**: A dynamic visual strand representing the mutual attraction vector and harmonic tension between the two bodies.

---

## ✨ Key Features

### 1. Numerical Orbital Physics
* Computes mutual gravitational forces based on **Newton's Law of Universal Gravitation**.
* Employs numerical time-step integration ($\Delta t$) with a softening factor to prevent gravitational singularities at close approach.
* Preserves center-of-mass (barycenter) stability to keep orbital dynamics centered within the viewport.

### 2. Four Interactive Trajectory Profiles
Switch between different orbital stages with a single click:
1. **Phase I: Stable Orbit** — Both bodies dance in a balanced, elliptical Keplerian orbit around their shared barycenter.
2. **Phase II: Periapsis Acceleration** — Gravitational force surges, tightening the orbital radius and accelerating velocity at closest approach (periapsis).
3. **Phase III: Hyperbolic Escape** — Body V achieves escape velocity ($v > v_e$) and separates onto an open hyperbolic trajectory into deep space.
4. **Phase IV: Body B Equilibrium** — Body B rests in calm central equilibrium, surrounded by small orbiting satellite particles.

### 3. Tactile Interactivity
* **Interactive Dragging**: Left-click (or touch) and drag either Body B or Body V to manually launch, slingshot, or reshape orbital paths.
* **Particle Mass Seeding**: Click anywhere in the void to spawn floating stardust particles that are pulled into the gravitational field.
* **Live Telemetry Sliders**: Real-time adjustment of:
  * **Gravity Constant ($G$)**: Scale gravitational pull from $0.1\times$ to $2.5\times$.
  * **Trail Persistence**: Adjust the decay rate of starlight ribbon paths (from brief trails to eternal paths).
  * **Time Scale ($dt$)**: Slow down or accelerate the simulation speed.

### 4. Particle Text Dispersion Tool
* Type any custom text note or message in the modal dialog.
* The system rasterizes the typography and disperses the characters into floating coordinate-driven stardust particles that drift into the cosmos.

### 5. Procedural Harmonic Audio (Web Audio API)
* Built-in browser-native synthesizer generates soothing ambient harmonic drone chords.
* Frequencies dynamically adapt to the active trajectory phase, creating a tranquil soundscape with zero external audio assets.

---

## 🛠️ Technologies Used

This project was built intentionally with **zero external libraries or frameworks** for maximum performance and portability:

| Technology | Purpose in Project |
| :--- | :--- |
| **HTML5 Canvas (2D Context)** | High-performance 60 FPS visual rendering, multi-layered glowing celestial coronas, stardust particles, and light ribbon trails via alpha composite blending. |
| **Vanilla JavaScript (ES6+)** | Vector mathematics, Newtonian physics integration, requestAnimationFrame loop, event listeners, and modular object-oriented classes. |
| **Web Audio API** | Real-time procedural audio synthesis using `AudioContext`, custom sine/triangle oscillators, low-pass biquad filters, and feedback delay loops. |
| **Modern CSS3** | Glassmorphic telemetry panel (`backdrop-filter: blur`), responsive layout, custom range sliders, and clean typography. |
| **Google Fonts** | Clean, technical typography using *Plus Jakarta Sans* and *JetBrains Mono*. |

---

## 📐 The Physics Behind the Simulation

The simulation is powered by fundamental celestial mechanics:

1. **Gravitational Force**:
   $$\vec{F} = G \cdot \frac{M \cdot m}{r^2 + \epsilon^2} \cdot \hat{r}$$
   *where $G$ is the gravitational constant, $M$ and $m$ are the body masses, $r$ is the distance between them, and $\epsilon$ is a softening factor ($45\,\text{AU}$) preventing infinite velocities during close encounters.*

2. **Acceleration & Kinematics**:
   $$\vec{a}_B = \frac{\vec{F}}{M}, \quad \vec{a}_V = -\frac{\vec{F}}{m}$$
   $$\vec{v}(t + \Delta t) = \vec{v}(t) + \vec{a} \cdot \Delta t$$
   $$\vec{x}(t + \Delta t) = \vec{x}(t) + \vec{v} \cdot \Delta t$$

3. **Luminous Starlight Ribbons**:
   * Rather than clearing the canvas completely each frame, the canvas is partially overwritten with a semi-transparent black fill (`rgba(3, 5, 10, trailAlpha)`).
   * This leaves a smooth, fading exposure trail behind the moving celestial bodies, visualising their Keplerian trajectories.

---

## 🚀 How to Run

### Option 1: Live in Browser (Instant)
Click to launch the live simulation on GitHub Pages:  
👉 **[https://bhagyashreedev.github.io/binary-orbit-simulation/](https://bhagyashreedev.github.io/binary-orbit-simulation/)**

### Option 2: Run Locally
No build tools, package managers, or local servers are required!

1. **Clone this repository**:
   ```bash
   git clone https://github.com/BhagyashreeDev/binary-orbit-simulation.git
   ```
2. **Navigate into the project**:
   ```bash
   cd binary-orbit-simulation
   ```
3. **Launch**: Double-click **`index.html`** or open it directly in any modern web browser (Google Chrome, Mozilla Firefox, Microsoft Edge, Safari).

---

## 📄 License

This project is open-source and free to use for educational, personal, and creative coding purposes.
