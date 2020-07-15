if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
			var container, stats, clock, counter;
			var camera, scene, renderer,LeftInsoleWireframe, lineWireframe,meshSurface;
							// CONTROLS
			var controls;

			
			var minDistance, maxDistance;
			//It is necessary to use the browser debugger to find out.
			//If we use blender, removing the cameras and the light bulb, it will be 0.
			//Depending on the software used to model, it may change.
			var childrenIndex=0;
			var mergeVerticesIndex=0.9;

			/*----------Left Insole------------*/
			var LeftInsole;
			var LeftInsoleWireframe;
			var LeftBall;
			var LeftBallPositions=[];
			var xVertexPositions=[];
			var LeftXVerticesPositions=[];
			var LeftVerticesValue=[];
			/* 
			 * 2 dimensions array "[vertexNumber][12 FSRs]"
			 * first represent vertex and the second is the distance to the FSR.
			 */
			var LeftDistanceToFSRs=[];
			var LeftInfluenceFactor=[];
			var LeftNumberLateralVertices;
			// The distances of the Fsrs have been taken from the lower left corner. 
			// When moving it in the center of the plane or in any other position it
			// is necessary to specify it to place the Fsrs in the appropriate position.
			var LeftInsoleXTranslation=50;
			var LeftInsoleYTranslation=139;
			var LeftXOffset=-60;
			//¡¡¡¡NOTA!!!!: Se ha invertido el modelo derecho en blender cambiando la escala X a -1
			// Esto implica que al exportar el collada el modelo tiene el mismo metodo de hacer
			// el espejo. Por tanto  las coordenadas son las mismas que en el modelo derecho.
			// El unico parametro que no va a coincidir sera LeftXOffset.
			var LeftFSRLocation=[
				[19-LeftInsoleXTranslation,164-LeftInsoleYTranslation],
				[11-LeftInsoleXTranslation,188-LeftInsoleYTranslation],
				[11-LeftInsoleXTranslation,212-LeftInsoleYTranslation],
				[13-LeftInsoleXTranslation,234-LeftInsoleYTranslation],
				[20-LeftInsoleXTranslation,255-LeftInsoleYTranslation],
				[37-LeftInsoleXTranslation,234-LeftInsoleYTranslation],
				[36-LeftInsoleXTranslation,211-LeftInsoleYTranslation],
				[37-LeftInsoleXTranslation,188-LeftInsoleYTranslation],
				[42-LeftInsoleXTranslation,256-LeftInsoleYTranslation],
				[61-LeftInsoleXTranslation,242-LeftInsoleYTranslation],
				[55-LeftInsoleXTranslation,219-LeftInsoleYTranslation],
				[76-LeftInsoleXTranslation,222-LeftInsoleYTranslation],
				[63-LeftInsoleXTranslation,199-LeftInsoleYTranslation],
				[86-LeftInsoleXTranslation,202-LeftInsoleYTranslation],
				[41-LeftInsoleXTranslation,164-LeftInsoleYTranslation],
				[64-LeftInsoleXTranslation,178-LeftInsoleYTranslation],
				[88-LeftInsoleXTranslation,181-LeftInsoleYTranslation],
				[87-LeftInsoleXTranslation,160-LeftInsoleYTranslation],
				[63-LeftInsoleXTranslation,156-LeftInsoleYTranslation],
				[58-LeftInsoleXTranslation,135-LeftInsoleYTranslation],
				[82-LeftInsoleXTranslation,138-LeftInsoleYTranslation],
				[74-LeftInsoleXTranslation,117-LeftInsoleYTranslation],
				[71-LeftInsoleXTranslation,96-LeftInsoleYTranslation],
				[70-LeftInsoleXTranslation,75-LeftInsoleYTranslation],
				[32-LeftInsoleXTranslation,54-LeftInsoleYTranslation],
				[29-LeftInsoleXTranslation,33-LeftInsoleYTranslation],
				[39-LeftInsoleXTranslation,15-LeftInsoleYTranslation],
				[61-LeftInsoleXTranslation,15-LeftInsoleYTranslation],
				[73-LeftInsoleXTranslation,32-LeftInsoleYTranslation],
				[51-LeftInsoleXTranslation,38-LeftInsoleYTranslation],
				[72-LeftInsoleXTranslation,53-LeftInsoleYTranslation],
				[52-LeftInsoleXTranslation,61-LeftInsoleYTranslation]
			]; 

			var LeftOriginalRotationX;
			var LeftOriginalRotationY;
			//---------------------------------------------------------------------
			
			/*----------Right Insole------------*/
			var RightInsole;
			var RightInsoleWireframe;
			var RightBallPositions=[];
			var RightXVerticesPositions=[];
			var RightVerticesValue=[];
			var RightDistanceToFSRs=[];
			var RightInfluenceFactor=[];
			var RightNumberLateralVertices;
			var RightInsoleXTranslation=50;
			var RightInsoleYTranslation=140;
			
			var RightXOffset=+60;

			var RightFSRLocation=[
				[19-RightInsoleXTranslation,164-RightInsoleYTranslation],
				[11-RightInsoleXTranslation,188-RightInsoleYTranslation],
				[11-RightInsoleXTranslation,212-RightInsoleYTranslation],
				[13-RightInsoleXTranslation,234-RightInsoleYTranslation],
				[20-RightInsoleXTranslation,255-RightInsoleYTranslation],
				[37-RightInsoleXTranslation,234-RightInsoleYTranslation],
				[36-RightInsoleXTranslation,211-RightInsoleYTranslation],
				[37-RightInsoleXTranslation,188-RightInsoleYTranslation],
				[42-RightInsoleXTranslation,256-RightInsoleYTranslation],
				[61-RightInsoleXTranslation,242-RightInsoleYTranslation],
				[55-RightInsoleXTranslation,219-RightInsoleYTranslation],
				[76-RightInsoleXTranslation,222-RightInsoleYTranslation],
				[63-RightInsoleXTranslation,199-RightInsoleYTranslation],
				[86-RightInsoleXTranslation,202-RightInsoleYTranslation],
				[41-RightInsoleXTranslation,164-RightInsoleYTranslation],
				[64-RightInsoleXTranslation,178-RightInsoleYTranslation],
				[88-RightInsoleXTranslation,181-RightInsoleYTranslation],
				[87-RightInsoleXTranslation,160-RightInsoleYTranslation],
				[63-RightInsoleXTranslation,156-RightInsoleYTranslation],
				[58-RightInsoleXTranslation,135-RightInsoleYTranslation],
				[82-RightInsoleXTranslation,138-RightInsoleYTranslation],
				[74-RightInsoleXTranslation,117-RightInsoleYTranslation],
				[71-RightInsoleXTranslation,96-RightInsoleYTranslation],
				[70-RightInsoleXTranslation,75-RightInsoleYTranslation],
				[32-RightInsoleXTranslation,54-RightInsoleYTranslation],
				[29-RightInsoleXTranslation,33-RightInsoleYTranslation],
				[39-RightInsoleXTranslation,15-RightInsoleYTranslation],
				[61-RightInsoleXTranslation,15-RightInsoleYTranslation],
				[73-RightInsoleXTranslation,32-RightInsoleYTranslation],
				[51-RightInsoleXTranslation,38-RightInsoleYTranslation],
				[72-RightInsoleXTranslation,53-RightInsoleYTranslation],
				[52-RightInsoleXTranslation,61-RightInsoleYTranslation]
		];
			var RightOriginalRotationX;
			var RightOriginalRotationY;
			//---------------------------------------------------------------------
			init();
			animate();
			function init() {
				
				
				
				counter=0;
				container = document.getElementById( 'container' );
				camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 2000 );
				//camera = new THREE.PerspectiveCamera(  70, window.innerWidth / window.innerHeight, 1, 1000);
				camera.position.set( 0, 250, 350 );
				camera.lookAt( new THREE.Vector3( 0, 10, 0 ) );
				scene = new THREE.Scene();
				scene.background = new THREE.Color( 0x72645b );
				clock = new THREE.Clock();

				// loading manager
				var loadingManager = new THREE.LoadingManager( function() {
					scene.add( LeftInsole );
					scene.add(LeftInsoleWireframe);
					scene.add( RightInsole );
					scene.add(RightInsoleWireframe);
				} );
				// collada
				var loader = new THREE.ColladaLoader( loadingManager );

				loader.load("insole_left2.dae", function ( geometry,materials ) {
					var colors=[];
					var i;
					var geometryModel=geometry.scene.children[ childrenIndex ].geometry;
					geometryModel=THREE.BufferGeometryUtils.mergeVertices(geometryModel,mergeVerticesIndex);//Combine some duplicate vertex
					geometryModel.computeVertexNormals();
					geometryModel.computeFaceNormals();
					var vertexNumber=geometryModel.attributes.position.array.length;
					geometry.scene.children[ childrenIndex ].geometry=geometryModel;
					/*Fill color for all insole and add attribute to the insole geometry */
					for(i=0;i<vertexNumber;i=i+3){
						colors[i]=0;
						colors[i+1]=1;
						colors[i+2]=1;
					}
					geometry.scene.children[ childrenIndex ].geometry.addAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
					/*---------------------------------------------------------------*/

					/*Create material.*/
					var envMap = new THREE.TextureLoader().load( 'metal.jpg' );
					envMap.mapping = THREE.SphericalReflectionMapping;
					var materialModel=new THREE.MeshBasicMaterial( { vertexColors: THREE.VertexColors,envMap: envMap, overdraw: 0.5 } ) ;
					geometry.scene.children[ childrenIndex ].material= materialModel;
					/*---------------------------------------------------------------*/

					LeftInsole = geometry.scene;
					LeftInsole.position.x+=LeftXOffset;
					LeftOriginalRotationX=LeftInsole.rotation.x;
					LeftOriginalRotationY=LeftInsole.rotation.y;
					var returnSearchVertex=	searchVertex(geometryModel);
					LeftXVerticesPositions=returnSearchVertex[0];
					LeftNumberLateralVertices=returnSearchVertex[1];//LeftNumberLateralVertices is used in updateColor and updateHeight
					LeftInsole.children[childrenIndex].receiveShadow=true;
					LeftVerticesValue=		getOriginalVerticesPositions(LeftXVerticesPositions,geometryModel);
					//We need distanto each FSR to calculate the influence factor.
					LeftDistanceToFSRs=		getDistanceToFSRs(LeftXVerticesPositions,LeftVerticesValue,LeftFSRLocation);
					LeftInfluenceFactor=	getInfluenceFactor(LeftXVerticesPositions,LeftDistanceToFSRs);
				} );


				loader.load("insole_left_surface2.dae", function ( geometry,materials ) {

					var material= new THREE.MeshBasicMaterial( {transparent: true,color:0x0000000,  wireframe: true} );
					geometry.scene.children[ childrenIndex ].material = material;



					var geometryModel=geometry.scene.children[ childrenIndex ].geometry;
					geometryModel=THREE.BufferGeometryUtils.mergeVertices(geometryModel,mergeVerticesIndex);
					geometryModel.computeVertexNormals();
					geometryModel.computeFaceNormals();
					geometry.scene.children[ childrenIndex ].geometry=geometryModel;



					LeftInsoleWireframe = geometry.scene;
					LeftInsoleWireframe.position.x+=LeftXOffset;
					LeftInsoleWireframe.position.y=0.2;
				} );

				loader.load("Modelo_Derecha4.dae", function ( geometry,materials ) {
					var colors=[];
					var i;
					
					var geometryModel=geometry.scene.children[ childrenIndex ].geometry;
					geometryModel=THREE.BufferGeometryUtils.mergeVertices(geometryModel,mergeVerticesIndex);//Combine some duplicate vertex
					geometryModel.computeVertexNormals();
					geometryModel.computeFaceNormals();
					var vertexNumber=geometryModel.attributes.position.array.length;
					geometry.scene.children[ childrenIndex ].geometry=geometryModel;
					/*Fill color for all insole and add attribute to the insole geometry */
					for(i=0;i<vertexNumber;i=i+3){
						colors[i]=0;
						colors[i+1]=1;
						colors[i+2]=1;
					}
					geometry.scene.children[ childrenIndex ].geometry.addAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
					/*---------------------------------------------------------------*/

					/*Create material.*/
					var envMap = new THREE.TextureLoader().load( 'metal.jpg' );
					envMap.mapping = THREE.SphericalReflectionMapping;
					var materialModel=new THREE.MeshBasicMaterial( { vertexColors: THREE.VertexColors,envMap: envMap, overdraw: 0.5 } ) ;
					geometry.scene.children[ childrenIndex ].material= materialModel;
					/*---------------------------------------------------------------*/

					RightInsole = geometry.scene;
					RightInsole.position.x+=RightXOffset;
					RightOriginalRotationX=RightInsole.rotation.x;
					RightOriginalRotationY=RightInsole.rotation.y;
					var returnSearchVertex=	searchVertex(geometryModel);
					RightXVerticesPositions=returnSearchVertex[0];
					RightNumberLateralVertices=returnSearchVertex[1];//RightNumberLateralVertices is used in updateColor and updateHeight

					RightVerticesValue=		getOriginalVerticesPositions(RightXVerticesPositions,geometryModel);
					//We need distanto each FSR to calculate the influence factor.
					RightDistanceToFSRs=		getDistanceToFSRs(RightXVerticesPositions,RightVerticesValue,RightFSRLocation);
					RightInfluenceFactor=	getInfluenceFactor(RightXVerticesPositions,RightDistanceToFSRs);
				} );

				loader.load("Modelo_Derecha_superficie.dae", function ( geometry,materials ) {

					var material= new THREE.MeshBasicMaterial( {transparent: true,color:0x0000000,  wireframe: true} );
					geometry.scene.children[ childrenIndex ].material = material;
					var geometryModel=geometry.scene.children[ childrenIndex ].geometry;
					geometryModel=THREE.BufferGeometryUtils.mergeVertices(geometryModel,mergeVerticesIndex);
					geometryModel.computeVertexNormals();
					geometryModel.computeFaceNormals();
					geometry.scene.children[ childrenIndex ].geometry=geometryModel;
					RightInsoleWireframe = geometry.scene;
					RightInsoleWireframe.position.x+=RightXOffset;
					RightInsoleWireframe.position.y=0.2;
				} );





				var geometry = new THREE.SphereGeometry( 5, 15, 15 );
				//var material = new THREE.MeshLambertMaterial( { color: 0x880000,transparent: true, opacity: 0.7} );
				var material = new THREE.MeshPhongMaterial( { color: 0xffaaaa,transparent: true, opacity: 0.9}  );

				LeftBall = new THREE.Mesh( geometry, material );
				LeftBall.position.set(LeftXOffset,25,0);
				LeftBallPositions=[LeftBall.position.x,LeftBall.position.z];//For some reazon Z and Y are inverted.In this case Y is Y
				scene.add(LeftBall);

				var material = new THREE.MeshPhongMaterial( { color: 0xffaaaa,transparent: true, opacity: 0.9}  );
				RightBall = new THREE.Mesh( geometry, material );
				RightBall.position.set(RightXOffset,25,0);
				RightBallPositions=[RightBall.position.x,RightBall.position.z];//For some reazon Z and Y are inverted
				scene.add(RightBall);



				var ambient = new THREE.AmbientLight( 0xffffff, 0.5 );
				scene.add( ambient );
				 // var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.8 );
				 // directionalLight.position.set( 1, 1, 0 ).normalize();
				 // scene.add( directionalLight );

				renderer = new THREE.WebGLRenderer();//{ antialias: true }
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );

				container.appendChild( renderer.domElement );
				stats = new Stats();
				container.appendChild( stats.dom );
				window.addEventListener( 'resize', onWindowResize, false );



				renderer.shadowMap.enabled = true;
				renderer.shadowMap.type = THREE.PCFSoftShadowMap;
				renderer.gammaInput = true;
				renderer.gammaOutput = true;

				controls = new THREE.OrbitControls( camera, renderer.domElement );
controls.update();



				var gridHelper = new THREE.GridHelper( 400, 40, 0x0000ff, 0x808080 );
				gridHelper.position.y = -50;
				scene.add( gridHelper );


				spotLight = new THREE.SpotLight( 0x00ffff, 1 );
				spotLight.position.set( 0, 300, 0 );
				spotLight.angle = Math.PI / 8;
				spotLight.penumbra = 0.2;
				spotLight.decay = 1;
				spotLight.distance = 500;
				scene.add( spotLight );
				//lightHelper = new THREE.SpotLightHelper( spotLight );
				//scene.add( lightHelper );

				 // shadowCameraHelper = new THREE.CameraHelper( spotLight.shadow.camera );
				 // scene.add( shadowCameraHelper );



			}
			function onWindowResize() {
				var width=window.innerWidth;
				var height=window.innerHeight;
				camera.aspect = width / height;
				camera.updateProjectionMatrix();
				renderer.setSize( width, height);
			}
/* 			function animate() {
				//
				requestAnimationFrame( animate );
				render();

				stats.update();

			} */

			function animate() {

				//setTimeout( function() {

					requestAnimationFrame( animate );

				//}, 1000 / 30 );
				render();

				//lightHelper.update();
				//shadowCameraHelper.update();
				stats.update();
			}




			function render() {
				var delta = clock.getDelta();

				if ( LeftInsole !== undefined && LeftInsoleWireframe!== undefined && RightInsole !== undefined && RightInsoleWireframe!== undefined) {
					LeftInsole.children[childrenIndex].geometry.attributes.color.needsUpdate = true;
					LeftInsole.children[childrenIndex].geometry.attributes.position.needsUpdate=true;
					LeftInsoleWireframe.children[childrenIndex].geometry.attributes.position.needsUpdate=true;
					LeftInsoleWireframe.children[childrenIndex].geometry.computeVertexNormals();
					LeftInsole.children[childrenIndex].geometry.computeVertexNormals();
					LeftInsole.children[childrenIndex].geometry.computeFaceNormals();

					RightInsole.children[childrenIndex].geometry.attributes.color.needsUpdate = true;
					RightInsole.children[childrenIndex].geometry.attributes.position.needsUpdate=true;
					RightInsoleWireframe.children[childrenIndex].geometry.attributes.position.needsUpdate=true;
					RightInsoleWireframe.children[childrenIndex].geometry.computeVertexNormals();
					RightInsole.children[childrenIndex].geometry.computeVertexNormals();



					//updateColor([512,512,512,512,512,512,512,512,512,512,512,512]);
					//LeftInsole.rotation.z += delta * 0.5;
					//LeftInsoleWireframe.rotation.z =LeftInsole.rotation.z;
					//lineWireframe.rotation.z=LeftInsole.rotation.z;
				}

				renderer.render( scene, camera );
			}


			function searchVertex(geometry) {

				var i;
				var j=0;//It is used to advance through the surface vertices.
				var k=0;//It is used to advance through the lateral vertices.

				var xLateralVerticesPositions=[];
				var xVerticesPositions=[];

				var normals= geometry.attributes.normal.array;
				var positions= geometry.attributes.position.array;
				//Remember for 1 vertex we have 3 positions in normals array to define normal vector for that array.
				for(i=0;i<normals.length;i=i+3){
					if(normals[i+2]>0.6){// if z component in normal vector iz bigger than 0.6 is  a insole surface vector.
						xVerticesPositions[j]=i;//Save only the position of the x component of the vector.Y and Z is the two next.
						j++;

					}else if(normals[i]>0.6|| normals[i]<-0.6 || normals[i+1]>0.6|| normals[i+1]<-0.6) //rule to detect lateral vertex with the normal vector.
					{

						var hightInterval=2;//take vertex than have 2 mm from the floor.
						if(positions[i+2]>hightInterval){
							xLateralVerticesPositions[k]=i;
							k++;
						}
					}
				}
				//Add lateral vertices to the end of xVerticesPositions. To maintain the same positions on the surface and in the wireframe.
				xVerticesPositions=xVerticesPositions.concat(xLateralVerticesPositions);

				return [xVerticesPositions,k];//k=numberLateralVertices
			}


		function getOriginalVerticesPositions(XVerticesPositions,geometry){//Save original vertices positions.
			var TempOriginalVerticesValues=[];

			for(i=0,j=0;i<XVerticesPositions.length;i++,j=j+3){
				TempOriginalVerticesValues[j]=geometry.attributes.position.array[XVerticesPositions[i]];
				TempOriginalVerticesValues[j+1]=geometry.attributes.position.array[XVerticesPositions[i]+1];
				TempOriginalVerticesValues[j+2]=geometry.attributes.position.array[XVerticesPositions[i]+2];
			}
			return TempOriginalVerticesValues;
		}




			function getDistanceToFSRs(xVertexPositions,verticesValue,FSRLocation) {
				//2 dimension array, for each vertex(X,Y,Z) we have 12 values in this array.
				var i;
				var j;
				var k;
				var TempDistanceToFSRs=[];
				for(i=0,k=0;i<xVertexPositions.length;i++,k=k+3){
					var temporalDistance=[];

					for(j=0;j<FSRLocation.length;j++){
						//We take only the 2D distance.
						temporalDistance[j]=Math.sqrt(Math.pow(verticesValue[k]-FSRLocation[j][0],2)+Math.pow(verticesValue[k+1]-FSRLocation[j][1],2));

					}
					TempDistanceToFSRs[i]=temporalDistance;
				}
				return TempDistanceToFSRs;
			}





		function getInfluenceFactor(xVertexPositions,distanceToFSRs){

		var i;
		var j;
		var k;
		var influenceFactor=[];

        for(i=0;i<xVertexPositions.length;i++){// For all vertices. i represents that vertex we are going to calculate.
			var iVertexInfluenceFactor=[];
			/* Map influece factor
			 *
			 * Distancia FSR |	Factor
			 * 		0-13	->	1-0.9
			 * 		13-20	->	0.9-0.5
			 * 		20-43	->	0.5-0
			 * maxF- [(Input Value-minD) / (maxD-minD) * equivalent interval]
			 */

			//Calculate all influence factor for each FSR
            for(j=0;j<distanceToFSRs[i].length;j++){ // j represents what FSR we are going to calculate the factor.
				var tempDistance=distanceToFSRs[i][j];
				if(tempDistance<43){
					var tempInfluenceFactor=0;

					switch (true) {
						case (distanceToFSRs[i][j]>11):
							tempInfluenceFactor=0.5-((distanceToFSRs[i][j]-15)/11*0.5);
							break;
						case (distanceToFSRs[i][j]>9):
							tempInfluenceFactor=0.9-((distanceToFSRs[i][j]-9)/5*0.4);
							break;

						default:// distanceToFSRs[i][j]>0
							tempInfluenceFactor=1-(distanceToFSRs[i][j]/13*0.1);
					}
					iVertexInfluenceFactor[j]=tempInfluenceFactor;
				}else{
					iVertexInfluenceFactor[j]=0;
				}
            }
            influenceFactor[i]=iVertexInfluenceFactor;//Finally we have 32 influence factor for i vertex.
        }

		return influenceFactor;
    }




	function updateColorLeft(FSRsValues){
		updateInsole(LeftInsole,LeftInsoleWireframe,FSRsValues,LeftXVerticesPositions,LeftVerticesValue,LeftInfluenceFactor,LeftNumberLateralVertices);
	}
	function updateColorRight(FSRsValues){
		updateInsole(RightInsole,RightInsoleWireframe,FSRsValues,RightXVerticesPositions,RightVerticesValue,RightInfluenceFactor,RightNumberLateralVertices);
	}

	//[512,512,512,512,512,512,512,512,512,512,512,512]
	function updateInsole(insole,meshInsole,fsrsValues,xVertexPositions,verticesValue,influenceFactor,numberLateralVertices){
		var i;
		var j;
		var k;
		var colors=insole.children[childrenIndex].geometry.attributes.color.array;
		var position=insole.children[childrenIndex].geometry.attributes.position.array;
		var meshPosition= meshInsole.children[childrenIndex].geometry.attributes.position.array;

		var verticesNumber=xVertexPositions.length;
		var upVertices=verticesNumber-numberLateralVertices;


        for(i=0,k=0;i<verticesNumber;i++,k+=3){//For each vertex obtain the total influence from all FSRs.

				var influence=0;

				for(j=0;j<influenceFactor[i].length;j++){
					if(influenceFactor[i][j]>0.0){
						var tempInfluence=fsrsValues[j]*influenceFactor[i][j];
						if(influence<tempInfluence){influence=tempInfluence;}
					}
				}

				if(influence>30){//The minimum value to start changing the vertex.
					//Update height vertices
					var height=heightMap(influence);
					var originalValue=verticesValue[k+2];
					position[xVertexPositions[i]+2]=originalValue-height;
					if(i<upVertices){meshPosition[k+2]=originalValue-height;} // update wireframe only for surface vertices.
					//Update color vertices
					var RGB=colorMap(influence);
					colors[xVertexPositions[i]]=RGB[0];
					colors[xVertexPositions[i]+1]=RGB[1];
					colors[xVertexPositions[i]+2]=RGB[2];
				}else{
					var originalValue=verticesValue[k+2];
					position[xVertexPositions[i]+2]=originalValue;//restore the original value
					if(i<upVertices){//Only for surface vertex. i>upVertices are the lateral vertices.
						//Update mesh original positions.
						//Remember that the wireframe has the same surface vertices as the insole model. And in the same positions in the position array.
						meshPosition[k+2]=originalValue;
						colors[xVertexPositions[i]]=1;
						colors[xVertexPositions[i]+1]=1;
						colors[xVertexPositions[i]+2]=1;
					}else{
						colors[xVertexPositions[i]]=0;
						colors[xVertexPositions[i]+1]=1;
						colors[xVertexPositions[i]+2]=1;
					}
				}
        }
	} 
	function pitchRollLeft(roll,pitch){
		LeftInsole.rotation.y=LeftOriginalRotationY+roll*2*Math.PI/360;
		LeftInsoleWireframe.rotation.y=LeftOriginalRotationY+roll*2*Math.PI/360;

		LeftInsole.rotation.x=LeftOriginalRotationX+pitch*2*Math.PI/360;
		LeftInsoleWireframe.rotation.x=LeftOriginalRotationX+pitch*2*Math.PI/360;

	}

	function pitchRollRight(roll,pitch){
		//RightInsole.rotation.y=RightOriginalRotationY+roll*2*Math.PI/360;
		//RightInsoleWireframe.rotation.y=RightOriginalRotationY+roll*2*Math.PI/360;

		//RightInsole.rotation.x=RightOriginalRotationX+pitch*2*Math.PI/360;
		//RightInsoleWireframe.rotation.x=RightOriginalRotationX+pitch*2*Math.PI/360;
		RightInsole.rotation.y=RightOriginalRotationY+roll;
		RightInsoleWireframe.rotation.y=RightOriginalRotationY+roll;
		RightInsole.rotation.x=RightOriginalRotationX+pitch;
		RightInsoleWireframe.rotation.x=RightOriginalRotationX+pitch;
		
	}

	
	function LeftAcceleration(gForce){
		acceleration(gForce,LeftBall,LeftBallPositions);
	}
	function RightAcceleration(gForce){
		acceleration(gForce,RightBall,RightBallPositions);
	}
	
	function acceleration(gForce,Ball,originalPositions){
		
		var color= Math.abs(gForce[0])>Math.abs(gForce[1]) ? mapGsToColor(gForce[0]) : mapGsToColor(gForce[1]);
		
		//var size=mapGsToSize(gForce);
		var xIncrement=mapGsToDistance(gForce[0]);
		var yIncrement=-mapGsToDistance(gForce[1]);
		Ball.position.x=originalPositions[0]+xIncrement;
		Ball.position.z=originalPositions[1]+yIncrement;//Ball.position.z is becouse z and y is inverted
		Ball.material.color.g=1-color/255;
		Ball.material.color.b=1-color/255;
	}
	
	function mapGsToColor(gForce){
		var maxG=3;
		if(Math.abs(gForce)<maxG){
			return Math.abs(gForce)/maxG*255;
		}else{
			return 255;
		}
		
	}
	
	function mapGsToDistance(gForce){
		var maxG=3;
		var maxDistance=50;
		var minDistance=-50;
		
		if(Math.abs(gForce)<maxG){
			return gForce/maxG*maxDistance;
		}else{
			return gForce>0 ? maxDistance: minDistance;
		}
		
	}
	
	
	function heightMap(value){
		//de momento entre 0-15
		return value/1023*5;

	}
	
	function colorMap(value){
		/*
		Si tenemos unos valores de 4096 por ejemplo hay que proceder de la siguiente manera:
		4096 son 2^12. Nos quedamos con el bit mas significativos para decidir si estamos
		en entre 0-2047 o 2047-4096.
		Dependiendo en que intervalo estamos aumentamos la componente en Rojo o Verde. 
		Con este procedimiento se consigue una escala de verde pasando por amarillo y finalmente rojo.
		*/
		var RGB=[];
		var lowBits=value&0b11111111111;
		lowBits=lowBits/2047;
		
		switch(value>>11){
			case 0:
				RGB[0]=lowBits;
				RGB[1]=1;
				RGB[2]=0;
			break;
			
			case 1:
				RGB[0]=1;
				RGB[1]=1-lowBits;
				RGB[2]=0;
			break;
			
			// case 2:
			
			// break;
			
			// case 3:
				
			// break;
		}
		
		return RGB;

	}