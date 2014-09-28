var createText = require('../')
var createBackground = require('gl-vignette-background')
var mat4 = require('gl-mat4')
var colorString = require('color-string')
var createDemo = require('canvas-testbed')

var ortho = mat4.create(),
    background,
    renderer,
    colorA = rgb('#60acd8'),
    colorB = rgb('#143251')

function render(gl, width, height) {
    gl.clearColor(0,0,0,1)
    gl.clear(gl.COLOR_BUFFER_BIT)

    //style background
    background.style({
        scale: [ 1/width * width, 1/height * width],
        aspect: 1,
        color1: colorA,
        color2: colorB,
        smoothing: [ -0.1, 1.0 ],
        noiseAlpha: 0.03,
    })
    background.draw()

    var pad = 20
    renderer.layout(window.innerWidth-pad*2); 

    //renderer expects upper-left origin 
    mat4.ortho(ortho, 0, width, height, 0, 0, 1)
    renderer.projection = ortho

    var b = renderer.getBounds()
    var x = width/2 - b.width/2,
        y = height/2 - b.height/2 - b.y

    renderer.draw(x, y)
} 

function start(options, gl) {
    background = createBackground(gl)

    //This is entirely optional, but allows more control over the wireframe
    //and becomes important for certain 2D effects (like shattering text)
    if (typeof options.triangulate === 'function')
        createText.prototype.triangulateGlyph = options.triangulate


    renderer = createText(gl, {
        font: options.font,
        text: 'lorem ipsum dolor.',
        fontSize: options.fontSize || 110,
        align: 'center',
        simplifyAmount: options.simplifyAmount,
        mode: options.fill ? gl.TRIANGLES : gl.LINE_STRIP
    })
}

function rgb(str) {
    return colorString.getRgb(str).map(function(c) {
        return c/255
    })
}

module.exports = function(options) {
    createDemo(render, start.bind(this, options), { context: 'webgl' })
}