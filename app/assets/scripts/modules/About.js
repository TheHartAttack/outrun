import throttle from "lodash/throttle"

class About {
  constructor() {
    this.about = document.querySelector(".about")
    this.image = document.querySelector(".about__image")
    this.text = document.querySelector(".about__text")
    this.paragraphs = Array.from(document.querySelectorAll(".about__paragraph"))

    this.browserHeight = window.innerHeight
    this.scrollThrottle = throttle(this.testScroll, 200).bind(this)

    this.setParagraphTextData()
    this.actions()
  }

  actions() {
    document.addEventListener("scroll", this.scrollThrottle)
  }

  testScroll() {
    if (window.scrollY + this.browserHeight * 0.5 > this.about.offsetTop) {
      this.activate()
    }
  }

  activate() {
    this.image.classList.add("about__image--activated")
    this.text.classList.add("about__text--activated")
    this.paragraphs.map(p => {
      p.classList.add("about__paragraph--activated")
    })

    document.removeEventListener("scroll", this.scrollThrottle)
  }

  setParagraphTextData() {
    this.paragraphs.map(p => {
      p.setAttribute("data-text", p.innerText)
    })
  }
}

export default About
