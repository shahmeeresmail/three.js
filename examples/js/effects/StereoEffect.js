/**
 * @author alteredq / http://alteredqualia.com/
 * @authod mrdoob / http://mrdoob.com/
 * @authod arodic / http://aleksandarrodic.com/
 * @authod fonserbc / http://fonserbc.github.io/
*/

THREE.StereoEffect = function ( renderer ) {

	var _stereo = new THREE.StereoCamera();
	_stereo.aspect = 0.5;
	var _multiviewExtension = null;
	var _multiviewFb = null;
	var _singlePassMultiview = true;

	if (renderer.extensions)
	{
	    _multiviewExtension = renderer.extensions.get("OVR_multiview");
	}

	if (useMultiviewExtension)
	{
	    if (_multiviewExtension)
	    {
	        if (renderer.webVR != null) {
                // getMultiviewFramebuffer(viewMask)
	            _multiviewFb = renderer.webVR.getMultiviewFramebuffer(3);
	        }
	        else {
	            _multiviewFb = _multiviewExtension.createMultiviewFramebufferEXT(1.0, 1.0, 3);
	        }

	        _useMultiviewWithoutExposedFuncs = false;
	    }
	    else
	    {
	        _useMultiviewWithoutExposedFuncs = true;
	    }
	}
	else
	{
	    _singlePassMultiview = false;
	    _useMultiviewWithoutExposedFuncs = false;
	    _multiviewExtension = null;
	}

	this.setEyeSeparation = function ( eyeSep ) {

		_stereo.eyeSep = eyeSep;

	};

	this.setSize = function ( width, height ) {

		renderer.setSize( width, height );

	};

	this.render = function ( scene, camera ) {

		scene.updateMatrixWorld();

		if ( camera.parent === null ) camera.updateMatrixWorld();

		_stereo.update( camera );

		var renderWidth;
		var renderHeight;
        
		if (renderer.getSize)
		{
		    var size = renderer.getSize();
		    renderWidth = size.width;
		    renderHeight = size.height;
		}
		else
		{
		    renderWidth = renderer.width;
		    renderHeight = renderer.height;
		}

		if (renderer.autoClear) renderer.clear();

		renderer.setScissorTest(true);

		if (_singlePassMultiview && (_useMultiviewWithoutExposedFuncs || _multiviewExtension))
		{
		    renderer.setScissor(0, 0, renderWidth, renderHeight);
		    renderer.setViewport(0, 0, renderWidth, renderHeight);
		    _stereo.cameraL.projectionMatrixR = _stereo.cameraR.projectionMatrix;

            if (_useMultiviewWithoutExposedFuncs)
            {
                // Note: The prerequesites for this path are:
                // 1. A compatible build of ANGLE that implements multiview with the following 
                // workarounds: autoCreateSbsViewsForMultiview, multiviewStereoViews, 
                // forceMultiviewSbs, multiviewEnabledWithViewIDUsage.
                // The source is available here:
                //   http://dfkjdlkjf
                //
                // 2. The browser must have draft extensions enabled and pass through shaders without
                // validation. Chromium for example, must be launched with these flags:
                //    --enable-webgl-draft-extensions
                //    --use-passthrough-cmd-decoder
                //
                // 3. A browser with WebGL 2.0 enabled
		        renderer.render(scene, _stereo.cameraL);
		    }
            else if (_multiviewExtension)
            {
                _multiviewExtension.bindMultiviewFramebufferEXT(gl.COLOR_ATTACHMENT0, _multiviewFb, 0, 0, 2);
                renderer.render(scene, _stereo.cameraL);
            }
		}
		else if (_multiviewExtension)
		{
		    // Multiview extension is used but only a single eye rendered at once
		    renderer.setScissor(0, 0, renderWidth, renderHeight);
		    renderer.setViewport(0, 0, renderWidth, renderHeight);
		    

		    _stereo.cameraL.projectionMatrixR = _stereo.cameraR.projectionMatrix;

            // Left Eye
		    _multiviewExtension.bindMultiviewFramebufferEXT(gl.COLOR_ATTACHMENT0, _multiviewFb, 0, 0, 1);
		    renderer.render(scene, _stereo.cameraL);

            // Right Eye (cameraL is specified here but the shader will use the value of projectionMatrixR chained with it)
		    _multiviewExtension.bindMultiviewFramebufferEXT(gl.COLOR_ATTACHMENT0, _multiviewFb, 0, 1, 1);
		    renderer.render(scene, _stereo.cameraL);
		}
		else
		{
		    // Side-by-side rendering without multiview
		    renderer.setScissor(0, 0, renderWidth / 2, renderHeight);
		    renderer.setViewport(0, 0, renderWidth / 2, renderHeight);

		    renderer.render(scene, _stereo.cameraL);

		    if (renderer.setScissorTest)
		    {
		        renderer.setScissor(renderWidth / 2, 0, renderWidth / 2, renderHeight);
		    }

		    renderer.setViewport(renderWidth / 2, 0, renderWidth / 2, renderHeight);
		    renderer.render(scene, _stereo.cameraR);
		}

        /*
		if (useMultiviewExtension == true)
		{
		    renderer.setScissor(0, 0, renderWidth, renderHeight);
		    renderer.setViewport(0, 0, renderWidth, renderHeight);
		    _stereo.cameraL.projectionMatrixR = _stereo.cameraR.projectionMatrix;

		    if (_singlePassMultiview)
		    {
		        if (_multiviewExtension != null) {
		            _multiviewExtension.bindMultiviewFramebufferEXT(gl.COLOR_ATTACHMENT0, _multiviewFb, 0, 0, 2);
		        }

		        //var multiViewMask = 2147418112; // Equivalent to: 0x7FFF0000

		        //renderer.setScissor(multiViewMask, multiViewMask, renderWidth / 2, renderHeight);
		        //renderer.setViewport(multiViewMask, multiViewMask, renderWidth / 2, renderHeight);

		        renderer.render(scene, _stereo.cameraL);
		    }
		    else if (_multiviewExtension)
		    {
		        if (_multiviewExtension != null) {
		            _multiviewExtension.bindMultiviewFramebufferEXT(gl.COLOR_ATTACHMENT0, _multiviewFb, 0, 0, 1);
		        }


		    }
		}
		else
		{
		    //_stereo.cameraL.projectionMatrixR = new Matrix4();
		    renderer.setScissor(0, 0, renderWidth / 2, renderHeight);
		    renderer.setViewport(0, 0, renderWidth / 2, renderHeight);
		    renderer.render(scene, _stereo.cameraL);

		    //_stereo.cameraR.projectionMatrixL = new Matrix4();
		    renderer.setScissor(renderWidth / 2, 0, renderWidth / 2, renderHeight);
		    renderer.setViewport(renderWidth / 2, 0, renderWidth / 2, renderHeight);
		    renderer.render(scene, _stereo.cameraR);
		}
        */

		renderer.setScissorTest(false);


	};

};
