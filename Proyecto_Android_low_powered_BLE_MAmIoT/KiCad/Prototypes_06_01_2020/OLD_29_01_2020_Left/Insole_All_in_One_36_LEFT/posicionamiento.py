import re

file=open('sin_sensores_sin_bordes.kicad_pcb', 'r')
plantilla36 = file.read()
#patronNombreComponentes=re.search(".*\(fp_text reference\s([\d\w]*)", plantilla36) 
originalFootprints={}
originalFootprints["R15"]=[0,0]
originalFootprints["Q1"] =[0,0]
originalFootprints["L3"] =[0,0]
originalFootprints["C4"] =[0,0]
originalFootprints["U3"] =[0,0]
originalFootprints["R4"] =[0,0]

for f in originalFootprints:
    patronPosiciones="\(at (\d+.\d+) (\d+.\d+).*\n.*\n.*\n.*\n.*\n.*reference "+f+".*\)"
    search=re.search(patronPosiciones, plantilla36)
    #print(search.group(2))
    originalFootprints[f]=[search.group(1),search.group(2)]
    #originalFootprints[f]=[search.span()[0],search.span()[1]]
   
plantilla37Route='../Insole_All_in_One_37/Insole_PCB.kicad_pcb'
file=open(plantilla37Route, 'r')
plantilla37 = file.read()

newPlantilla37Route="../Insole_All_in_One_37/Insole_PCB2.kicad_pcb"
newFile = open(newPlantilla37Route, "a")
newPlantilla37=plantilla37

for f in originalFootprints:
    patronPosiciones="\(at (\d+.\d+) (\d+.\d+).*\n.*\n.*\n.*\n.*\n.*reference "+f+".*\)"
    search=re.search(patronPosiciones, plantilla37)
    #print(search.group(0))
    UpdateX=search.group(0).replace(search.group(1),originalFootprints[f][0])
    UpdateY=UpdateX.replace(search.group(2),originalFootprints[f][1])
    #print(UpdateY)

    newPlantilla37=re.sub(patronPosiciones,UpdateY,newPlantilla37)
    #print(search.group(2))
    #originalFootprints[f]=[search.group(1),search.group(2)]
    #originalFootprints[f]=[search.span()[0],search.span()[1]]
newFile.write(newPlantilla37)
newFile.close()