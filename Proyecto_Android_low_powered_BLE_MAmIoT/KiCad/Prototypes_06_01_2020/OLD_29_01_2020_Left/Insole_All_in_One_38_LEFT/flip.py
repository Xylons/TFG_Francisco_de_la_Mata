import re

fileToFlip='Insole_PCB.kicad_pcb'
startRemplacement=800 # Es importante no modificar la cabecera donde pone layers .....

fileToFlip=open(fileToFlip, 'r')
stringFileToFlip=fileToFlip.read()
flipedString=stringFileToFlip[startRemplacement:]

flipedString=flipedString.replace("F.Cu","F_.Cu")
flipedString=flipedString.replace("B.Cu","F.Cu")
flipedString=flipedString.replace("F_.Cu","B.Cu")


flipedString=flipedString.replace("F.Adhes","F_.Adhes")
flipedString=flipedString.replace("B.Adhes","F.Adhes")
flipedString=flipedString.replace("F_.Adhes","B.Adhes") 

flipedString=flipedString.replace("F.Paste","F_.Paste")
flipedString=flipedString.replace("B.Paste","F.Paste")
flipedString=flipedString.replace("F_.Paste","B.Paste") 

flipedString=flipedString.replace("F.SilkS","F_.SilkS")
flipedString=flipedString.replace("B.SilkS","F.SilkS")
flipedString=flipedString.replace("F_.SilkS","B.SilkS")

flipedString=flipedString.replace("F.Mask","F_.Mask")
flipedString=flipedString.replace("B.Mask","F.Mask")
flipedString=flipedString.replace("F_.Mask","B.Mask")

patronF_SilkS="\(fp_text.*\(layer F.SilkS\)\n.*\(justify mirror\)\)\n.*"
patronB_SilkS="\(fp_text.*\(layer B.SilkS\)\n.*\d\)\)"
labelsF_SilkS = re.findall(patronF_SilkS, flipedString)
labelsB_SilkS = re.findall(patronB_SilkS, flipedString)


for l in labelsF_SilkS:
    clean_text=l.replace("(justify mirror)","")
    flipedString=flipedString.replace(l,clean_text)

for l in labelsB_SilkS:
    clean_text=l+"(justify mirror)"
    flipedString=flipedString.replace(l,clean_text)



flipedFile = open("Insole_PCB2.kicad_pcb", "a")
flipedFile.write(stringFileToFlip[:startRemplacement]+flipedString)
flipedFile.close()

""" flipedString.replace("","")
flipedString.replace("","")
flipedString.replace("","") """