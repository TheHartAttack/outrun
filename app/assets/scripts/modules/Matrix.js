import themeColor from "./ThemeColor"

class Matrix {
  constructor() {
    this.body = document.querySelector("body")
    this.injectCanvas()
    this.draw()
    this.actions()
  }

  //Actions
  actions() {
    window.addEventListener("resize", () => this.resize())
  }

  //Methods
  resize() {
    this.canvas.width = document.body.clientWidth
    this.canvas.height = document.body.clientHeight
    clearInterval(this.int)
    this.draw()
  }

  injectCanvas() {
    this.canvas = document.createElement("canvas")
    this.canvas.classList.add("matrix")
    this.canvas.width = document.body.clientWidth
    this.canvas.height = document.body.clientHeight
    this.body.insertBefore(this.canvas, this.body.firstChild)
  }

  draw() {
    const ctx = this.canvas.getContext("2d")
    const w = this.canvas.width
    const h = this.canvas.height
    ctx.fillStyle = "#000"
    ctx.fillRect(0, 0, w, h)
    const cols = Math.floor(w / 20) + 1
    const ypos = Array(cols).fill(0)

    const codeRain = () => {
      ctx.fillStyle = "#0001"
      ctx.fillRect(0, 0, w, h)
      ctx.fillStyle = themeColor.color.string()
      ctx.font = "15pt monospace"
      ypos.forEach((y, ind) => {
        const text = String.fromCharCode(Math.random() * 128)
        const x = ind * 20
        ctx.fillText(text, x, y)
        if (y > 100 + Math.random() * h * 50) ypos[ind] = 0
        else ypos[ind] = y + 20
      })
    }

    this.int = setInterval(codeRain, 50)
  }
}

export default Matrix
