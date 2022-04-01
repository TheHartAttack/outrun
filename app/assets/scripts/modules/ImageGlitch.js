import throttle from "lodash/throttle"
import debounce from "lodash/debounce"

class ImageGlitch {
  constructor(thresholdPercent) {
    this.images = Array.from(document.querySelectorAll(".image"))
    this.setBackgroundImage()

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

  setBackgroundImage() {
    this.images.map(image => {
      const bgImage = image.getAttribute("data-image")
      const imageGlitchDiv = document.createElement("div")
      imageGlitchDiv.classList.add("image__glitch")
      image.append(imageGlitchDiv)
      image.style.setProperty("--bgImage", `url(${bgImage})`)
    })
  }

  calcCaller() {
    this.images.forEach(image => {
      if (image.isRevealed == false) {
        this.calculateIfScrolledTo(image)
      }
    })
  }

  hideInitially() {
    this.images.forEach(image => {
      image.isRevealed = false
    })
    this.images[this.images.length - 1].isLastImage = true
  }

  calculateIfScrolledTo(image) {
    if (window.scrollY + this.browserHeight > image.offsetTop) {
      let scrollPercent = (image.getBoundingClientRect().y / this.browserHeight) * 100
      if (scrollPercent < this.thresholdPercent) {
        image.classList.add("image--activated")
        image.isRevealed = true
        if (image.isLastImage) {
          window.removeEventListener("scroll", this.scrollThrottle)
        }
      }
    }
  }
}

export default ImageGlitch
