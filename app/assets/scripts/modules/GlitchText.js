import throttle from "lodash/throttle"
import debounce from "lodash/debounce"

class GlitchText {
  constructor(thresholdPercent) {
    this.glitchItems = Array.from(document.querySelectorAll(".glitch-item"))

    this.getGlitchElsAndSetDataText()
    this.thresholdPercent = thresholdPercent
    this.browserHeight = window.innerHeight
    this.hideInitially()
    this.scrollThrottle = throttle(this.calcCaller, 200).bind(this)
    this.events()
  }

  events() {
    window.addEventListener("scroll", this.scrollThrottle)
    window.addEventListener(
      "resize",
      debounce(() => {
        this.browserHeight = window.innerHeight
      }, 200)
    )
  }

  getGlitchElsAndSetDataText() {
    this.glitchItems.map(item => {
      let elArray = Array.from(item.querySelectorAll("p, h1, h2, h3, h4, h5, h6, li, a"))
      elArray.map(el => {
        el.setAttribute("data-text", el.innerText)
      })
      item.elementsArray = elArray
    })
  }

  calcCaller() {
    this.glitchItems.forEach(item => {
      if (item.isRevealed == false) {
        this.calculateIfScrolledTo(item)
      }
    })
  }

  hideInitially() {
    this.glitchItems.forEach(item => {
      item.elementsArray.map(el => {
        el.classList.add("glitch-element")
      })
      item.isRevealed = false
    })
    this.glitchItems[this.glitchItems.length - 1].isLastItem = true
  }

  calculateIfScrolledTo(item) {
    if (window.scrollY + this.browserHeight > item.offsetTop) {
      let scrollPercent = (item.getBoundingClientRect().y / this.browserHeight) * 100
      if (scrollPercent < this.thresholdPercent) {
        item.classList.add("glitch--activated")
        item.isRevealed = true
        if (item.isLastItem) {
          window.removeEventListener("scroll", this.scrollThrottle)
        }
      }
    }
  }
}

export default GlitchText
