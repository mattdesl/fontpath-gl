var decompose = require('fontpath-shape2d')
var triangulate = require('shape2d-triangulate')

module.exports = function(glyph) {
    var shapes = decompose(glyph)

    for (var i=0; i<shapes.length; i++) 
        shapes[i].simplify( this.font.units_per_EM*this.simplifyAmount, shapes[i] )

    var triList = triangulate(shapes)

    // unroll into a single array
    var tris = []
    for (var i=0; i<triList.length; i++) {
        var t = triList[i].getPoints();
        tris.push(t[0].x, t[0].y)
        tris.push(t[1].x, t[1].y)
        tris.push(t[2].x, t[2].y)
    }

    return {
        positions: new Float32Array(tris)
    }
}