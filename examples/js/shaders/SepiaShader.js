/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Sepia tone shader
 * based on glfx.js sepia shader
 * https://github.com/evanw/glfx.js
 */

THREE.SepiaShader = {

	uniforms: {

		"tDiffuse": { value: null },
		"amount":   { value: 1.0 }

	},

	vertexShader: [

		"out vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = GET_PROJECTION_MATRIX * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform float amount;",

		"uniform sampler2D tDiffuse;",

		"in vec2 vUv;",

		"void main() {",

			"vec4 color = texture( tDiffuse, vUv );",
			"vec3 c = color.rgb;",

			"color.r = dot( c, vec3( 1.0 - 0.607 * amount, 0.769 * amount, 0.189 * amount ) );",
			"color.g = dot( c, vec3( 0.349 * amount, 1.0 - 0.314 * amount, 0.168 * amount ) );",
			"color.b = dot( c, vec3( 0.272 * amount, 0.534 * amount, 1.0 - 0.869 * amount ) );",

			"colorOutput = vec4( min( vec3( 1.0 ), color.rgb ), color.a );",

		"}"

	].join( "\n" )

};
