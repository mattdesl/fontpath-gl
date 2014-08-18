var TestFont = require('fontpath-test-fonts/lib/Alegreya-Bold.otf');    

require('./demo')({
    fill: false,
    simplifyAmount: 0.04,
    font: TestFont,

    //the triangulation function, adding some random steiner points!
    triangulate: require('./triangulate-random')
})