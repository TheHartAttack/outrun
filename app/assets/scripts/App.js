import "../styles/styles.css"
import Utils from "./modules/Utils"
import Matrix from "./modules/Matrix"
import Outrun from "./modules/Outrun"
import GlitchText from "./modules/GlitchText"
import ImageGlitch from "./modules/ImageGlitch"

new Utils()
new Matrix()
new Outrun()
new GlitchText(75)
new ImageGlitch(75)

if (history.scrollRestoration) {
  history.scrollRestoration = "manual"
} else {
  window.onbeforeunload = function () {
    window.scrollTo(0, 0)
  }
}

if (module.hot) {
  module.hot.accept()
}
