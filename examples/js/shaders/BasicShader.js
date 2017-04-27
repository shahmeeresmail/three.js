/**
 * @author mrdoob / http://www.mrdoob.com
 *
 * Simple test shader
 */

THREE.BasicShader = {

	uniforms: {},

	vertexShader: [

		"void main() {",

			"gl_Position = GET_PROJECTION_MATRIX * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [
		"void main() {",

			"colorOutput = vec4( 1.0, 0.0, 0.0, 0.5 );",
		"}"

	].join( "\n" )

};
