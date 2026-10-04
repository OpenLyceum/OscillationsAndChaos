# Model - Oscillations and Chaos

This document describes the model (the underlying physics, math, and behavior) for the simulation, in
terms appropriate for an educator. It is the companion to
[implementation-notes.md](./implementation-notes.md), which targets developers.

## Overview

Four classical-mechanics screens explore oscillations and chaotic dynamics. Each screen integrates
ordinary differential equations (ODEs) in real time; students adjust parameters and observe motion,
energy, vectors, and graphs. Numerical integration method and time step are configurable in
Preferences (RK4 default).

| Screen | Focus |
|---|---|
| **Single Spring** | Damped vertical mass–spring with gravity; energy graphs |
| **Double Spring** | Coupled oscillators; normal modes; energy transfer |
| **Pendulum** | Nonlinear pendulum; exact sin(θ) dynamics; period vs amplitude |
| **Double Pendulum** | Deterministic chaos; sensitive initial conditions; path tracing |

All screens use **g = 9.8 m/s²** unless noted. Positions in spring screens are vertical displacements
from the spring's natural length (positive downward in the model, converted to view coordinates in
the view layer).

## Single Spring

**Equation of motion:**

m·a = −k·x − b·v + m·g

Forces: spring (−k·x), damping (−b·v), gravity (+m·g downward).

**State:** position x, velocity v.

**Energy:**

- KE = ½·m·v²
- Spring PE = ½·k·x²
- Gravitational PE = −m·g·x
- Total mechanical energy = KE + spring PE + gravitational PE (decreases when b > 0)

**Parameter ranges (controls):** mass 0.1–5.0 kg; spring constant 1–50 N/m; damping 0–20 N·s/m.

**Pedagogy:** underdamped oscillation (small b), critical damping b ≈ 2√(km), overdamped (large b),
undamped energy conservation (b = 0).

## Double Spring

Two masses in series: top spring (k₁) to ceiling, middle spring (k₂) between masses.

```
m₁·a₁ = −k₁·x₁ + k₂·(x₂ − x₁) − b₁·v₁ + m₁·g
m₂·a₂ = −k₂·(x₂ − x₁) − b₂·v₂ + m₂·g
```

**State:** x₁, v₁, x₂, v₂.

**Normal modes:** symmetric (in-phase) and antisymmetric (out-of-phase) patterns; general motion is
their superposition.

**Parameter ranges:** each mass 0.1–5.0 kg; each spring constant 1–50 N/m; each damping 0–20 N·s/m.

## Pendulum

Point mass on a massless rigid rod; **exact** sin(θ) equation (not the small-angle approximation):

α = −(g/L)·sin(θ) − (b/(m·L²))·ω

**State:** angle θ from vertical (rad), angular velocity ω.

**Energy:** KE = ½·m·L²·ω²; PE = m·g·L·(1 − cos θ) (zero at θ = 0).

**Parameter ranges:** mass 0.1–5.0 kg; length 0.5–5.0 m; damping 0–2 N·m·s.

**Pedagogy:** period increases with amplitude; mass does not affect small-angle period T ≈ 2π√(L/g).

## Double Pendulum

Coupled nonlinear pendulum (Lagrangian-derived):

```
(m₁+m₂)L₁²α₁ + m₂L₁L₂α₂ cos(θ₁−θ₂) + m₂L₁L₂ω₂² sin(θ₁−θ₂) = −(m₁+m₂)gL₁ sin θ₁ − b₁ω₁
m₂L₂²α₂ + m₂L₁L₂α₁ cos(θ₁−θ₂) − m₂L₁L₂ω₁² sin(θ₁−θ₂) = −m₂gL₂ sin θ₂ − b₂ω₂
```

**State:** θ₁, ω₁, θ₂, ω₂.

**Chaos:** deterministic but sensitive to initial conditions; the second bob's trail shows
non-repeating paths for generic starts.

**Parameter ranges:** each mass 0.1–5.0 kg; each length 0.5–5.0 m. One shared damping coefficient b = b₁ = b₂, from 0–2 N·m·s, is applied to both rods. The integrator solves the system above for α₁ and α₂.

**Energy:** coupled KE includes m₂L₁L₂ω₁ω₂ cos(θ₁−θ₂); PE = −(m₁+m₂)gL₁ cos θ₁ − m₂gL₂ cos θ₂.

## Numerical integration

Configurable solvers (Preferences):

| Solver | Role |
|---|---|
| **RK4** | Default; fixed step, good accuracy/speed balance |
| **Adaptive RK45** | Variable internal step |
| **Forest–Ruth PEFRL** | Symplectic for undamped springs and the single pendulum; RK4 fallback with damping or for the double pendulum |
| **Dormand–Prince 8(7)** | High-order adaptive |

Nominal fixed steps: 0.01 ms – 5 ms (default **1 ms**). Smaller steps improve accuracy for chaotic
motion but slow playback. Frame dt is capped so tab switches do not inject huge jumps.

## Simplifications and assumptions

- Motion confined to a plane (no conical pendulum, no out-of-plane spring motion).
- Ideal Hooke's-law springs (massless, linear).
- Massless rigid rods; point masses.
- Linear damping F = −b·v (or rotational equivalent); no pivot friction unless damping is set.
- Constant g = 9.8 m/s².
- No air drag beyond the explicit damping parameter.

## References

- Marion & Thornton, *Classical Dynamics of Particles and Systems* — coupled oscillators, Lagrangian pendula.
- Strogatz, *Nonlinear Dynamics and Chaos* — double pendulum and sensitive dependence.
