import * as THREE from "three"
import {EffectComposer} from "three/examples/jsm/postprocessing/EffectComposer.js"
import {RenderPass} from "three/examples/jsm/postprocessing/RenderPass.js"
import {FilmPass} from "three/examples/jsm/postprocessing/FilmPass.js"
import {GlitchPass} from "three/examples/jsm/postprocessing/GlitchPass.js"
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls"
import {OBJLoader} from "three/examples/jsm/loaders/OBJLoader"
import themeColor from "./ThemeColor"

class Outrun {
  constructor() {
    this.body = document.querySelector("body")
    this.outrun = document.querySelector(".outrun")
    this.color = themeColor.color.string()
    this.interactive = {
      mouseX: 0,
      mouseY: 0,
      targetX: 0,
      targetY: 0,
      windowX: window.innerWidth / 2,
      windowY: window.innerHeight / 2
    }

    this.injectCanvas()
    this.init()
    this.actions()
    this.fog()
    this.lights()
    this.sunlight()
    this.terrain()
    this.mountains()
    this.road()
    this.city()
    this.trees()
    this.car()
    this.animate()
  }

  injectCanvas() {
    this.canvas = document.createElement("canvas")
    this.canvas.classList.add("outrun__canvas")
    this.canvas.width = document.body.clientWidth
    this.canvas.height = window.innerHeight - 2
    this.outrun.append(this.canvas)
  }

  actions() {
    window.addEventListener("resize", () => this.resize())
    document.addEventListener("mousemove", e => this.onDocumentMouseMove(e))
  }

  resize() {
    this.camera.aspect = window.innerWidth / (window.innerHeight - 2)
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(document.body.clientWidth, window.innerHeight - 2)
    this.composer.setSize(document.body.clientWidth, window.innerHeight - 2)
    this.interactive.windowX = window.innerWidth / 2
    this.interactive.windowY = window.innerHeight / 2
  }

  onDocumentMouseMove(event) {
    this.interactive.mouseX = event.clientX - this.interactive.windowX
    this.interactive.mouseY = event.clientY - this.interactive.windowY
  }

  init() {
    //Scene
    this.scene = new THREE.Scene()
    this.scene.background = null

    //Camera
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / (window.innerHeight - 2), 0.1, 10000)
    this.camera.position.set(0, -0.75, 100)

    //Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true
    })
    this.renderer.setSize(window.innerWidth, window.innerHeight - 2)
    this.renderer.setPixelRatio(window.devicePixelRatio)

    //Composer
    const size = this.renderer.getDrawingBufferSize(new THREE.Vector2())
    this.renderTarget = new THREE.WebGLMultisampleRenderTarget(size.width, size.height)
    this.composer = new EffectComposer(this.renderer, this.renderTarget)

    //Texture Loader
    this.textureLoader = new THREE.TextureLoader()

    //Object Loader
    this.objectLoader = new OBJLoader()

    //Clock
    this.clock = new THREE.Clock()
    this.clock.start()
    const date = new Date()
    this.currentTime = date.getTime()

    //Orbit Controls
    // this.controls = new OrbitControls(this.camera, this.canvas)

    //Ambient Light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.1)
    this.scene.add(ambientLight)

    //Postprocessing
    const renderPass = new RenderPass(this.scene, this.camera)
    this.composer.addPass(renderPass)

    this.glitch = new GlitchPass()
    this.glitch.goWild = true
    this.glitch.enabled = false
    this.composer.addPass(this.glitch)

    const filmPass = new FilmPass(0.375, 0, 0, false)
    this.composer.addPass(filmPass)
  }

  fog() {
    this.scene.fog = new THREE.Fog(this.color, 1, 375)
  }

  lights() {
    const blueLight = new THREE.PointLight(0x0032a0, 1, 10)
    blueLight.position.set(5, 2.5, 100)
    blueLight.castShadow = false
    this.scene.add(blueLight)

    const pinkLight = new THREE.PointLight(0xd00070, 1, 10)
    pinkLight.position.set(-5, 2.5, 100)
    pinkLight.castShadow = false
    this.scene.add(pinkLight)
  }

  sunlight() {
    const light = new THREE.DirectionalLight(0xffffff, 1)
    light.position.set(0, 0, -2500)
    light.target = this.camera

    this.scene.add(light)
  }

  terrain() {
    this.radius = 2500
    const roadWidth = 1

    const geo = new THREE.CylinderGeometry(this.radius, this.radius, this.radius / 10, this.radius * 5, this.radius / 10, true)
    geo.rotateZ(THREE.MathUtils.degToRad(90))

    const {array} = geo.attributes.position
    for (let i = 0; i < array.length; i++) {
      if (i % 3 == 0) {
        const x = array[i]
        const y = array[i + 1]
        const z = array[i + 2]

        if (Math.abs(x) > roadWidth + Math.ceil(Math.random() * 2)) {
          const height = Math.pow(Math.abs(x), 2) * 0.000001
          array[i + 1] = y * (1 + Math.random() * 0.00025 + height / 5)
          array[i + 2] = z * (1 + Math.random() * 0.00025 + height / 5)
        }

        if (Math.abs(x) < roadWidth) {
          array[i + 1] = y * 0.9999
          array[i + 2] = z * 0.9999
        }
      }
    }

    const mat = new THREE.MeshPhongMaterial({
      color: 0xc19a6b,
      flatShading: true
    })

    const gridMat = new THREE.MeshPhongMaterial({
      emissive: this.color,
      wireframe: true
    })

    const mesh = new THREE.Mesh(geo, mat)
    mesh.position.set(0, -this.radius, 0)

    this.terrainMesh = mesh

    const gridMesh = new THREE.Mesh(geo, gridMat)
    gridMesh.position.set(0, -this.radius, 0)
    this.terrainGridMat = gridMat
    this.terrainGrid = gridMesh

    this.scene.add(mesh)
    this.scene.add(gridMesh)
  }

  road() {
    const roadWidth = 2
    const geo = new THREE.CylinderGeometry(this.radius, this.radius, roadWidth, this.radius * 5, this.radius / 10, true)
    geo.rotateZ(THREE.MathUtils.degToRad(90))

    const mat = new THREE.MeshPhongMaterial({
      color: 0x999999
    })

    const mesh = new THREE.Mesh(geo, mat)
    mesh.position.set(0, -this.radius, 0)

    this.scene.add(mesh)
  }

  mountains() {
    const mountainCount = 2500

    const mat = new THREE.MeshPhongMaterial({
      color: 0x666666,
      flatShading: true
    })

    this.mountainsGroup = new THREE.Group()
    this.linesGroup = new THREE.Group()
    this.mountainsGroup.add(this.linesGroup)
    this.mountainsGroup.translateOnAxis(new THREE.Vector3(0, -1, 0), this.radius)
    this.mountainsGroup.position.y = -this.radius
    this.scene.add(this.mountainsGroup)

    for (let i = 0; i < mountainCount; i++) {
      let posX = Math.ceil((Math.random() - 0.5) * 500)

      const width = Math.abs(posX) / 2 + Math.ceil((Math.random() * Math.abs(posX)) / 5)
      const rotation = THREE.MathUtils.degToRad(Math.random() * 360)
      const geo = new THREE.ConeGeometry(width, width, 4, 3, false, rotation)

      geo.translate(0, this.radius, 0)

      const mesh = new THREE.Mesh(geo, mat)

      if (Math.abs(posX) <= 10) {
        mesh.visible = false
      }

      mesh.position.x = posX
      const rotX = THREE.MathUtils.degToRad(Math.random() * 360)
      mesh.rotation.x = rotX

      //Lines
      const edges = new THREE.EdgesGeometry(geo)
      const lines = new THREE.LineSegments(
        edges,
        new THREE.LineBasicMaterial({
          color: this.color
        })
      )
      lines.position.x = mesh.position.x
      lines.position.z = mesh.position.y
      lines.rotation.x = rotX

      if (Math.abs(posX) <= 10) {
        lines.visible = false
      }

      this.mountainsGroup.add(mesh)
      this.linesGroup.add(lines)
    }
  }

  city() {
    const buildingCount = 64

    this.cityGroup = new THREE.Group()
    for (let i = 1; i <= buildingCount; i++) {
      const width = Math.ceil(10 + Math.random() * 30)
      const height = Math.ceil(100 + Math.random() * 300)
      const geo = new THREE.BoxGeometry(width, height, 25)

      const randMod = Math.round(Math.random() * 10)
      const posX = (i / 2 - buildingCount / 4 - 0.5) * 25 + randMod
      const posZ = Math.ceil(Math.random() * 10)

      let color
      switch (posZ) {
        case 0:
          color = new THREE.Color(0.55, 0.55, 0.55)
          break
        case 1:
          color = new THREE.Color(0.5, 0.5, 0.5)
          break
        case 2:
          color = new THREE.Color(0.45, 0.45, 0.45)
          break
        case 3:
          color = new THREE.Color(0.4, 0.4, 0.4)
          break
        case 4:
          color = new THREE.Color(0.35, 0.35, 0.35)
          break
        case 5:
          color = new THREE.Color(0.3, 0.3, 0.3)
          break
        case 6:
          color = new THREE.Color(0.25, 0.25, 0.25)
          break
        case 7:
          color = new THREE.Color(0.2, 0.2, 0.2)
          break
        case 8:
          color = new THREE.Color(0.15, 0.15, 0.15)
          break
        case 9:
          color = new THREE.Color(0.1, 0.1, 0.1)
          break
        case 10:
          color = new THREE.Color(0.05, 0.05, 0.05)
          break
      }

      const mat = new THREE.MeshBasicMaterial({
        color,
        fog: false
      })

      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.set(posX, 0, posZ * 10)

      this.cityGroup.add(mesh)
    }
    this.cityGroup.position.z = -2500
    this.scene.add(this.cityGroup)
  }

  trees() {
    const treeCount = 5000
    const scale = 0.002

    this.treeGroup = new THREE.Group()
    this.treeLinesGroup = new THREE.Group()
    this.treeGroup.add(this.treeLinesGroup)
    this.treeGroup.translateOnAxis(new THREE.Vector3(0, -1, 0), this.radius)
    this.treeGroup.position.y = -this.radius

    this.objectLoader.load("./assets/models/tree.obj", obj => {
      const treeObj = obj.children[0]
      treeObj.geometry.translate(0, this.radius * (1 / scale), 0)
      treeObj.geometry.scale(scale, scale, scale)

      for (let i = 0; i < treeCount; i++) {
        const tree = treeObj.clone()

        tree.material.side = THREE.DoubleSide
        tree.material.color = this.color

        let posX = Math.ceil((Math.random() - 0.5) * 8)
        const rotX = THREE.MathUtils.degToRad(Math.random() * 360)
        const rotY = THREE.MathUtils.degToRad(Math.random() * 360)

        if (Math.abs(posX) < 1) {
          if (i % 2 == 0) {
            posX += 1
          } else {
            posX -= 1
          }
        }
        if (posX < 0) {
          posX -= 0.5
        } else {
          posX += 0.5
        }

        tree.position.x = posX
        tree.rotation.y = rotY
        tree.rotation.x = rotX

        this.treeGroup.add(tree)

        //Lines
        const treeLineColor = new THREE.Color(this.color).multiply(new THREE.Color(1, 1, 1, 0.1))
        const edges = new THREE.EdgesGeometry(tree.geometry)
        const lines = new THREE.LineSegments(
          edges,
          new THREE.LineBasicMaterial({
            color: this.color,
            transparent: true,
            opacity: 0.25
          })
        )
        lines.position.x = posX
        lines.rotation.x = rotX
        lines.rotation.y = rotY
        this.treeLinesGroup.add(lines)
      }
    })

    this.glitch.enabled = true
    this.scene.add(this.treeGroup)

    setTimeout(() => {
      this.glitch.enabled = false
    }, 250)
  }

  car() {
    const scale = 0.00375
    this.carGroup = new THREE.Group()
    this.carGroup.translateOnAxis(new THREE.Vector3(0, -1, 0), this.radius)
    this.carGroup.position.y = -this.radius
    this.carGroup.rotation.x = THREE.MathUtils.degToRad(2.22)

    this.objectLoader.load("./assets/models/car.obj", car => {
      car.translateOnAxis(new THREE.Vector3(0, 1, 0), this.radius * 1.00005)
      car.scale.set(scale, scale, scale)

      car.children[1].material.color.set(0xff0000)
      car.children[2].material.color.set(0x000000)
      car.children[3].material.color.set(0xff0000)
      car.children[4].material.color.set(0x333333)
      car.children[5].material.color.set(0x000000)
      //Windows
      car.children[6].material.color.set(0x666666)
      //Lights
      car.children[7].material.color.set(0xffffff)
      car.children[8].material.color.set(0xff0000)
      car.children[9].material.color.set(0x333333)
      car.children[10].material.color.set(0x111111)
      car.children[11].material.color.set(0xff0000)
      car.children[12].material.color.set(0xff0000)
      car.children[13].material.color.set(0x333333)
      car.children[14].material.color.set(0x333333)
      car.children[15].material.color.set(0x333333)
      car.children[16].material.color.set(0x000000)
      car.children[17].material.color.set(0x000000)
      car.children[18].material.color.set(0x333333)
      car.children[19].material.color.set(0x000000)
      car.children[20].material.color.set(0x000000)
      car.children[21].material.color.set(0x000000)
      car.children[22].material.color.set(0x333333)
      car.children[23].material.color.set(0x000000)
      car.children[24].material.color.set(0x111111)
      car.children[25].material.color.set(0x333333)
      car.children[26].material.color.set(0xff0000)
      //Main Body
      car.children[27].material.color.set(0xff0000)
      //Tyres
      car.children[28].material.color.set(0x111111)

      this.carBody = car.children[27]

      car.rotation.x = THREE.MathUtils.degToRad(90)
      car.rotation.y = THREE.MathUtils.degToRad(180)

      this.carGroup.add(car)

      const lights = new THREE.Group()

      const leftLight = new THREE.SpotLight(0xffffff, 1, 10, THREE.MathUtils.degToRad(11.25), 1, 1)
      leftLight.position.set(-0.2, -1.75, 96.375)
      leftLight.distance = 25
      lights.add(leftLight)
      const leftLightHelper = new THREE.SpotLightHelper(leftLight)
      // this.scene.add(leftLightHelper)

      const rightLight = new THREE.SpotLight(0xffffff, 1, 10, THREE.MathUtils.degToRad(11.25), 1, 1)
      rightLight.position.set(0.2, -1.75, 96.375)
      rightLight.distance = 25
      lights.add(rightLight)
      const rightLightHelper = new THREE.SpotLightHelper(rightLight)
      // this.scene.add(rightLightHelper)

      this.glitch.enabled = true
      this.scene.add(lights)
      this.scene.add(this.carGroup)

      setTimeout(() => {
        this.glitch.enabled = false
      }, 250)
    })
  }

  animate() {
    if (window.scrollY < window.innerHeight - 2) {
      const elapsedTime = this.clock.getElapsedTime()
      const rotation = THREE.MathUtils.degToRad(elapsedTime * 0.15)

      //Camera
      this.interactive.targetX = this.interactive.mouseX * 0.001
      this.interactive.targetY = this.interactive.mouseY * 0.001

      let speedX = 0.05
      let speedY = 0.05

      if ((this.interactive.targetX < 0 && this.camera.position.x < 0) || (this.interactive.targetX > 0 && this.camera.position.x > 0)) {
        speedX = 0.05 * (1 - Math.abs(this.camera.position.x))
      }

      if ((this.interactive.targetY > 0 && this.camera.position.y < -0.75) || (this.interactive.targetY < 0 && this.camera.position.y > -0.75)) {
        speedY = 0.05 * (1 - Math.abs(this.camera.position.y + 0.75))
      }

      const posX = Math.max(Math.min(this.camera.position.x + speedX * this.interactive.targetX, 1), -1)
      const posY = Math.max(Math.min(this.camera.position.y - speedY * this.interactive.targetY, 0.25), -1.75)

      this.camera.position.x = posX
      this.camera.position.y = posY

      //Glitch
      // if (Math.round(elapsedTime) % Math.round(Math.random() * 500) == 0) {
      //   this.glitch.enabled = true
      //   const duration = 125 + Math.round(Math.random() * 375)
      //   setTimeout(() => {
      //     this.glitch.enabled = false
      //   }, duration)
      // }

      this.color = new THREE.Color(themeColor.color.string())
      this.scene.fog.color = this.color

      //Terrain
      this.terrainGridMat.emissive = this.color
      this.terrainGrid.rotation.x = this.terrainMesh.rotation.x = rotation

      //Mountains
      this.mountainsGroup.rotation.x = rotation
      this.linesGroup.children.map(line => {
        line.material.color = this.color
      })

      //City
      this.cityGroup.children.map(building => {
        let color
        switch (building.position.z) {
          case 0:
            color = new THREE.Color(0.55, 0.55, 0.55)
            break
          case 10:
            color = new THREE.Color(0.5, 0.5, 0.5)
            break
          case 20:
            color = new THREE.Color(0.45, 0.45, 0.45)
            break
          case 30:
            color = new THREE.Color(0.4, 0.4, 0.4)
            break
          case 40:
            color = new THREE.Color(0.35, 0.35, 0.35)
            break
          case 50:
            color = new THREE.Color(0.3, 0.3, 0.3)
            break
          case 60:
            color = new THREE.Color(0.25, 0.25, 0.25)
            break
          case 70:
            color = new THREE.Color(0.2, 0.2, 0.2)
            break
          case 80:
            color = new THREE.Color(0.15, 0.15, 0.15)
            break
          case 90:
            color = new THREE.Color(0.1, 0.1, 0.1)
            break
          case 100:
            color = new THREE.Color(0.05, 0.05, 0.05)
            break
        }
        building.material.color = color.multiply(new THREE.Color(this.color))
      })

      //Trees
      this.treeGroup.rotation.x = rotation
      this.treeGroup.children.map(tree => {
        if (tree.type == "Mesh") {
          tree.material.color = this.color
        } else if (tree.type == "Group") {
          tree.children.map(treeLine => {
            treeLine.material.color = this.color
          })
        }
      })

      //Car
      if (this.carBody) {
        this.carBody.material.color.set(this.color)
      }

      // this.renderer.render(this.scene, this.camera)
      this.composer.render()
    }

    requestAnimationFrame(this.animate.bind(this))
  }
}

export default Outrun
