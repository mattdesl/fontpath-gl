var decompose = require('fontpath-shape2d')
var triangulate = require('shape2d-triangulate')

function randomSteinerPoints(glyph, N) {
    var steinerPoints = [];
    N = typeof N === "number" ? N : 200;
    for (var count=0; count<N; count++) {
        var dat = { 
            x: Math.round(Math.random()*(glyph.width+glyph.hbx)), 
            y: -glyph.hby + Math.round(Math.random()*(glyph.height+glyph.hby)) 
        };
        steinerPoints.push(dat);
    }
    return steinerPoints;
}

module.exports = function(glyph) {
    var shapes = decompose(glyph)

    for (var i=0; i<shapes.length; i++) 
        shapes[i].simplify( this.font.units_per_EM*this.simplifyAmount, shapes[i] )

    var points = 100
    var triList = triangulate(shapes, randomSteinerPoints(glyph, points))

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
