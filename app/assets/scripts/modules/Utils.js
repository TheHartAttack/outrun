import themeColor from "./ThemeColor"
const Color = require("color")

class Utils {
  constructor() {
    this.body = document.querySelector("body")
    this.loading = document.querySelector(".loading")
    this.arrow = document.querySelector(".outrun__arrow")

    setInterval(() => {
      this.updateColor()
    }, 50)

    this.arrowVisible()
    this.actions()
  }

  actions() {
    window.addEventListener("load", e => this.finishedLoading(e))
    this.arrow.addEventListener("click", e => this.arrowScroll(e))
  }

  finishedLoading() {
    console.log("Loaded")
    this.body.classList.add("body--loaded")
    this.loading.classList.add("loading--finished")
    setTimeout(() => {
      this.loading.classList.add("loading--hidden")
    }, 5000)
  }

  arrowVisible() {
    setTimeout(() => {
      this.arrow.style.visibility = "visible"
    }, 5000)
  }

  arrowScroll(e) {
    e.preventDefault()
    window.scrollTo({
      top: window.innerHeight - 2,
      behavior: "smooth"
    })
  }

  updateColor() {
    document.documentElement.style.setProperty("--themeColor", themeColor.color.string())

    const color = Color(themeColor.color.string())
    const lighten = color.lighten(1)
    document.documentElement.style.setProperty("--themeColorLightened", lighten)
  }
}

export default Utils
