// Selectors
const svg = document.querySelector('.js-svg')
const wrapper = document.querySelector('.js-wrapper')
const cursor = document.querySelector('.js-cursor')
const grain = document.querySelector('.js-grain')

const mouse = {
  x: window.innerWidth,
  y: 0,
  smoothX: window.innerWidth,
  smoothY: 0,
  vx: 0,
  vy: 0,
  smoothVx: 0,
  smoothVy: 0,
  diff: 0
}
const head = {
  x: 0,
  y: 0,
  vx: 0,
  vy: 0
}
const viewport = {
  width: window.innerWidth,
  height: window.innerHeight
}
const particles = []
let particleCnt = 0

// Mouse move
function onMouseMove(e) {
  mouse.vx += mouse.x - e.pageX
  mouse.vy += mouse.y - e.pageY

  mouse.x = e.pageX
  mouse.y = e.pageY
}
window.addEventListener('mousemove', onMouseMove)

// Touch move
function onTouchMove(e) {
  if (e.touches.length > 0) {
    const touch = e.touches[0]
    mouse.vx += mouse.x - touch.pageX
    mouse.vy += mouse.y - touch.pageY

    mouse.x = touch.pageX
    mouse.y = touch.pageY
  }
}
window.addEventListener('touchstart', onTouchMove, { passive: false })
window.addEventListener('touchmove', onTouchMove, { passive: false })

// Resize
function onResize() {
  viewport.width = window.innerWidth
  viewport.height = window.innerHeight

  svg.style.width = viewport.width + 'px'
  svg.style.height = viewport.height + 'px'
}
window.addEventListener('resize', onResize)
onResize()

// Emitter
function emitParticle() {
  let x = 0
  let y = 0
  let vx = 0
  let vy = 0
  let size = 0

  if (mouse.diff > 0.01) {
    x = mouse.smoothX
    y = mouse.smoothY
    vx = mouse.smoothVx * -0.25
    vy = mouse.smoothVy * -0.25
    size = mouse.diff * 0.25
  } else {
    x = head.x
    y = head.y
    vx = head.vx * 2
    vy = head.vy * 2
    size = Math.hypot(head.vx, head.vy) * 3
  }

  const particle = new Particle(x, y, vx, vy, size)
  particleCnt += 5

  particles.push(particle)
  wrapper.prepend(particle.el)
}

// Render
function render(time) {
  // Animate grain
  //grain.setAttribute('seed', time * 0.05)

  // Smooth mouse
  mouse.smoothX += (mouse.x - mouse.smoothX) * 0.1
  mouse.smoothY += (mouse.y - mouse.smoothY) * 0.1

  mouse.smoothVx += (mouse.vx - mouse.smoothVx) * 0.1
  mouse.smoothVy += (mouse.vy - mouse.smoothVy) * 0.1

  mouse.vx *= 0.85
  mouse.vy *= 0.85

  mouse.diff = Math.hypot(mouse.x - mouse.smoothX, mouse.y - mouse.smoothY)

  emitParticle()

  // Cursor
  cursor.style.setProperty('--x', mouse.smoothX + 'px')
  cursor.style.setProperty('--y', mouse.smoothY + 'px')

  // Move head
  const headX = viewport.width * 0.5 + viewport.width * 0.375 * Math.cos(time * 0.0006)
  const headY = viewport.height * 0.5 + viewport.width * 0.05 * Math.cos(time * 0.0011)

  head.vx = head.x - headX
  head.vy = head.y - headY

  head.x = headX
  head.y = headY

  // Render particles
  particles.forEach(particle => {
    particle.render(time)
  })

  // raf
  requestAnimationFrame(render)
}

window.addEventListener('load', render)

/**
 * Particle
 */
class Particle {
  // Constructor
  constructor(x, y, vx, vy, size) {
    this.size = size
    this.x = x
    this.y = y
    this.vx = vx
    this.vy = vy
    this.seed = Math.random() * 1000
    this.freq = (0.5 + Math.random() * 1) * 0.01
    this.amplitude = (1 - Math.random() * 2) * 0.5

    const hue = particleCnt % 360;
    const saturation = 100;
    const lightness = 50;

    this.color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

    this.el = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    this.el.setAttribute('cx', this.x)
    this.el.setAttribute('cy', this.y)
    this.el.setAttribute('r', this.size)
    this.el.setAttribute('fill', this.color)
  }

  // Kill
  kill() {
    const self = this

    particles.forEach((particle, index) => {
      if (particle === self) {
        particles.splice(index, 1)
      }
    })

    self.el.remove()
  }

  // Render
  render(time) {
    this.x += Math.cos((time + this.seed) * this.freq) * this.amplitude + this.vx
    this.y += Math.sin((time + this.seed) * this.freq) * this.amplitude + this.vy

    this.vx *= 0.95
    this.vy *= 0.95

    this.size += Math.hypot(this.vx, this.vy)
    this.size *= 0.85

    this.el.setAttribute('cy', this.y)
    this.el.setAttribute('cx', this.x)
    this.el.setAttribute('r', this.size)

    if (this.size < 1) {
      this.kill()
    }
  }
}