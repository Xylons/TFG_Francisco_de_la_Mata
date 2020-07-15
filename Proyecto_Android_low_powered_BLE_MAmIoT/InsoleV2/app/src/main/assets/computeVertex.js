var influence;
var influenceFactor;
var verticesNumber;
var firstExecution=0;
var fsrsValues;
onmessage = function (message) {
    if(firstExecution!=0){
    for(i=0;i<verticesNumber;i++){//For each vertex obtain the total influence from all FSRs.
        for(j=0;j<influenceFactor[i].length;j++){
            if(influenceFactor[i][j]>0.0){
                var auxInfluence=fsrsValues[j]*influenceFactor[i][j];
                if(influence[i]<auxInfluence){
                    influence[i]=auxInfluence;
                }
            }
        }
    }
    this.postMessage("");

    }else{
        influence=message.data.i;
        influenceFactor=message.data.iF;
        fsrsValues=message.data.fV;
        verticesNumber=influenceFactor.length;
        firstExecution++;
    }





}

 
