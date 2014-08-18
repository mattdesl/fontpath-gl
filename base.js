var TextRenderer = require('fontpath-simple-renderer')
var createShader = require('gl-basic-shader')

var mat4 = require('gl-matrix').mat4

var createMesh = require('gl-basic-mesh')

var tmp3 = [ 0, 0, 0 ]

function TriangleRenderer(gl, options) {
    if (!(this instanceof TriangleRenderer))
        return new TriangleRenderer(gl, options)
    options = options||{}

    TextRenderer.call(this, options)

    if (!gl)
        throw 'must specify gl parameter'
    this.gl = gl
    this.mode = typeof options.mode === 'number' ? options.mode : gl.TRIANGLES

    this.projection = mat4.create()
    this.view = mat4.create()

    this.simplifyAmount = typeof options.simplifyAmount === 'number' ? options.simplifyAmount : 0.02

    this.color = options.color || [1, 1, 1, 1]
    var shader = options.shader
    if (!shader) {
        this.defaultShader = createShader(gl)
        shader = this.defaultShader
    }
    this.shader = shader

    this.meshCache = {}
}

//inherits from TextRenderer
TriangleRenderer.prototype = Object.create(TextRenderer.prototype)
TriangleRenderer.constructor = TriangleRenderer

//copy statics
TriangleRenderer.Align = TextRenderer.Align

TriangleRenderer.prototype.triangulateGlyph = function(glyph) {
    throw new Error('this method should be implemented by subclasses')
}

TriangleRenderer.prototype._drawGlyph = function(data) {
    var chr = String.fromCharCode(data.charCode)
    var cached = this.meshCache[ chr ]
    if (!cached) {
        var triangulated = this.triangulateGlyph(data.glyph)

        var newMesh = createMesh(this.gl, {
            positions: triangulated.positions,
            positionSize: 2,
            elements: triangulated.cells,
            shader: this.shader
        })

        cached = {
            mesh: newMesh,
            modelTransform: mat4.create()
        }

        this.meshCache[chr] = cached
    }

    var mesh = cached.mesh
    mesh.bind()

    var modelTransform = cached.modelTransform
    mat4.identity( modelTransform )

    tmp3[0] = data.position[0]
    tmp3[1] = data.position[1]
    tmp3[2] = 0
    mat4.translate( modelTransform, modelTransform, tmp3 )

    tmp3[0] = data.scale[0]
    tmp3[1] = data.scale[1]
    tmp3[3] = 1
    mat4.scale( modelTransform, modelTransform, tmp3 )

    var uniforms = mesh.shader.uniforms,
        uTypes = mesh.shader.types.uniforms
    
    if (uTypes.tint) mesh.shader.uniforms.tint = this.color
    if (uTypes.model) mesh.shader.uniforms.model = modelTransform
    if (uTypes.projection) mesh.shader.uniforms.projection = this.projection
    if (uTypes.view) mesh.shader.uniforms.view = this.view
    
    mesh.draw(this.mode)

    mesh.unbind()
}

TriangleRenderer.prototype.draw = function(x, y, start, end) {
    var result = this.render(x, y, start, end)

    for (var i=0; i<result.underlines.length; i++) {
        //..draw underlines somehow
    }
    for (var i=0; i<result.glyphs.length; i++) {
        var g = result.glyphs[i]
        this._drawGlyph(g)
    }
}

TriangleRenderer.prototype.dispose = function() {
    for (var k in this.meshCache) {
        this.meshCache[k].mesh.dispose()
    }
    this.meshCache = null
    if (this.defaultShader) {
        this.defaultShader.dispose()
        this.defaultShader = null
    }
    this.gl = null
}

module.exports = TriangleRenderer