var TestFont = require('fontpath-test-fonts/lib/OpenSans-Regular.ttf');    

require('./demo')({
    fill: true,
    simplifyAmount: 0.01,
    font: TestFont,
    fontSize: 50,
    //the triangulation function, use the default poly2tri
    triangulate: require('../triangulate')
})