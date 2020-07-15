function changeHeight(FSRsValues){
		
		var i;
		var k;

		var position=elf.children[childrenIndex].geometry.attributes.position.array;
		var meshPosition= meshGeometryWireframe.children[childrenIndex].geometry.attributes.position.array;
		var verticesNumber=xVertexPositions.length;
		var upVertices=verticesNumber-numberLateralVertices;
		
        for(i=0,k=0;i<verticesNumber;i++,k+=3){//For each vertex obtain the total influence from all FSRs.
			var influence=0;
			for(j=0;j<influenceFactor[i].length;j++){
				var tempInfluence=FSRsValues[j]*influenceFactor[i][j];
				if(influence<tempInfluence){influence=tempInfluence;}
			}
			if(influence>30){
				var height=heightMap(influence);
				
				var originalValue=verticesValue[k+2];
				position[xVertexPositions[i]+2]=originalValue-height;
				
				if(i<upVertices){meshPosition[k+2]=originalValue-height;} // update wireframe only if update surface vertices.
				
			}else{
				var originalValue=verticesValue[k+2];
				position[xVertexPositions[i]+2]=originalValue;
				if(i<upVertices){meshPosition[k+2]=originalValue;}
				}

        }
		
		
	}

		//What is the maximum distance from a vertex to any FSR.Between the minimum distances of all vertices, which is the largest.
	function obtainMaxMinDistance(){
		var i;
		var j;
		maxDistance=0;
		minDistance=0;
		for(i=0;i<xVertexPositions.length;i++){
			var min=280;
			var max=0;
			for(j=0;j<distanceToFSRs[i].length;j++){
				if(distanceToFSRs[i][j]>max){max=distanceToFSRs[i][j];}
				if(distanceToFSRs[i][j]<min){min=distanceToFSRs[i][j];}
			}
			if(maxDistance<max){maxDistance=max;}
			if(minDistance<min){minDistance=min;}
			
		}
		
	}