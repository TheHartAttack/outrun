import Color from "color"

let themeColor = {color: Color.hsl(0, 100, 50)}
setInterval(() => {
  themeColor.color = themeColor.color.rotate(0.5)
}, 50)

export default themeColor
