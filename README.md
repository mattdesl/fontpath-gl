# fontpath-gl

[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

![img2](http://i.imgur.com/ZMKUtQb.png)

A 2D [fontpath renderer](https://github.com/mattdesl/fontpath-simple-renderer) for stackgl. As opposed to [gl-render-text](https://www.npmjs.org/package/gl-render-text), which is texture based, this renderer is path-based.

Here is a quick overview of some pros/cons to the fontpath approach:

- `+` More control over line width, word wrapping, kerning, underlines, etc
- `+` More accurate paths, matching the curves from TTF/OTF files
- `+` More control for rich text animations and effects (such as triangulation)
- `+` Better for scaling text to large sizes and dynamically changing and re-wrapping it
- `+` Not relying on canvas means we don't need to deal with @font-face loading issues
- `-` Not robust for Complex Text Layout or non-Latin languages
- `-` Not ideal for small (hinted) font sizes or bitmap-based fonts
- `-` Not performant for large blocks of text since each glyph uses its own gl-vao
- `-` Triangulation with poly2tri is not always robust; fails with some fonts
- `-` The fontpath tool is not yet very stable or well-tested
- `-` Lack of anti-aliasing in some browsers, or when rendering to an offscreen buffer

## Usage

[![NPM](https://nodei.co/npm/fontpath-gl.png)](https://nodei.co/npm/fontpath-gl/)

The following will produce filled text, drawn with triangles. 

```js
var MyFont = require('fontpath-test-fonts/lib/OpenSans-Regular.ttf')

var createText = require('fontpath-gl')
var mesh = createText(gl, {
	text: 'lorem ipsum dolor',
	font: MyFont,
	fontSize: 150,
	align: 'right'
	wrapWidth: 150
})

mesh.projection = ortho
mesh.draw(x, y)
```

This inherits from [fontpath-simple-renderer](https://github.com/mattdesl/fontpath-simple-renderer), so the constructor options, functions and members are the same. Some additional features: 

### `mesh = createText(gl[, options])`

In addition to the typical fontpath renderer options, you can also pass:

- `mode` a primitive type, defaults to `gl.TRIANGLES`
- `color` a RGBA color to tint the text, defaults to white `[1, 1, 1, 1]`
- `shader` a shader to use when rendering the glyphs, instead of the default. 
- `simplifyAmount` in the case of the default poly2tri triangulator, this provides a means of simplifying the path to reduce the total number of vertices

### `mesh.color`

Upon rendering, this will set the `tint` uniform of the shader (available with default shader). This is useful for coloring the text.

#### `mesh.projection`

The projection 4x4 matrix for the text, applied to each glyph. Identity by default.

#### `mesh.view`

A 4x4 view matrix to apply to each glyph. Identity by default.

#### `mesh.mode`

The rendering mode, default `gl.TRIANGLES`. 

#### `mesh.dispose()`

Disposes the mesh and its default shader. If you provided a shader during constructor, that shader will not be disposed. 

## triangulation


[![img](http://i.imgur.com/OAWWJb3.png)](mattdesl.github.io/fontpath-gl/demo/)
<sup>Click to view demo</sup>

This uses [fontpath-shape2d](https://www.npmjs.org/package/fontpath-shape2d) and [poly2tri](https://www.npmjs.org/package/poly2tri) to approximate the bezier curves and triangulate the glyphs. In some cases these may fail to triangulate, or produce undesirable results. [Tess2](https://github.com/memononen/tess2.js) is more robust in some cases, but it leads to a less pleasing wireframe and doesn't allow for steiner points.

To allow for custom triangulation without bloating the filesize with poly2tri, it has been broken off into a different file and only included with the `index.js` entry point. So, say you want to use Tess2 instead, your code would have to look like this:

```js
//require the base class
var TextRenderer = require('fontpath-gl/base')

TextRenderer.prototype.triangulateGlyph = function (glyph) {
	//... triangulate with Tess2, perhaps also do some simplification
	//...
	
	//return an object in the following format
	return {
		positions: new Float32Array([ x1,y1,x2,y2... ]) //xy positions, required
		cells: new Uint16Array([ i0,i1,i2... ]) //indices, optional
	}	
}

module.exports = TextRenderer
```

`cells` is optional, but indexing will produce more efficient rendering.

You can also require `fontpath-gl/triangulate` which exposes the default `triangulateGlyph` function.

See the [demo](demo/) folder for an example of custom triangulation.

## roadmap

- underline rendering
- more efficient caching / packing of vertex data
- removing gl-matrix in favour of small stackgl modules
- improve triangulation robustness

## License

MIT, see [LICENSE.md](http://github.com/mattdesl/fontpath-gl/blob/master/LICENSE.md) for details.
