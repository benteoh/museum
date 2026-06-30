// components/projects/previews/boidsMath.ts
export type Particle = { x: number; y: number; vx: number; vy: number }

const MAX_SPEED = 1.5
const MAX_FORCE = 0.04
const COHESION_RADIUS = 80
const SEPARATION_RADIUS = 20
const ALIGNMENT_RADIUS = 80
const W_COHESION = 0.001
const W_SEPARATION = 0.05
const W_ALIGNMENT = 0.04

export function createParticles(count: number, width: number, height: number): Particle[] {
  return Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2
    const speed = 0.4 + Math.random() * 0.8
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
    }
  })
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}

function dist(ax: number, ay: number, bx: number, by: number) {
  return Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2)
}

export function tick(particles: Particle[], width: number, height: number): Particle[] {
  return particles.map((p) => {
    let dx = 0, dy = 0
    let cohX = 0, cohY = 0, cohN = 0
    let sepX = 0, sepY = 0
    let aliVx = 0, aliVy = 0, aliN = 0

    for (const other of particles) {
      if (other === p) continue
      const d = dist(p.x, p.y, other.x, other.y)
      if (d < COHESION_RADIUS) { cohX += other.x; cohY += other.y; cohN++ }
      if (d < SEPARATION_RADIUS && d > 0) { sepX += (p.x - other.x) / d; sepY += (p.y - other.y) / d }
      if (d < ALIGNMENT_RADIUS) { aliVx += other.vx; aliVy += other.vy; aliN++ }
    }

    if (cohN > 0) { dx += (cohX / cohN - p.x) * W_COHESION; dy += (cohY / cohN - p.y) * W_COHESION }
    dx += sepX * W_SEPARATION
    dy += sepY * W_SEPARATION
    if (aliN > 0) { dx += (aliVx / aliN - p.vx) * W_ALIGNMENT; dy += (aliVy / aliN - p.vy) * W_ALIGNMENT }

    dx = clamp(dx, -MAX_FORCE, MAX_FORCE)
    dy = clamp(dy, -MAX_FORCE, MAX_FORCE)

    let vx = p.vx + dx
    let vy = p.vy + dy
    const speed = Math.sqrt(vx ** 2 + vy ** 2)
    if (speed > MAX_SPEED) { vx = (vx / speed) * MAX_SPEED; vy = (vy / speed) * MAX_SPEED }

    let x = p.x + vx
    let y = p.y + vy
    if (x < 0) x += width
    if (x > width) x -= width
    if (y < 0) y += height
    if (y > height) y -= height

    return { x, y, vx, vy }
  })
}
