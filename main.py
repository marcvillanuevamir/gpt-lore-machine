import eel
import os
import glob
import json
from lib.recorder import recorder
from lib.gpt import GPT
from threading import Thread


GPT=GPT()
recorder=recorder()

templates=glob.glob("templates/*.json")
templates.sort()
print(templates)
template_index=0
current_template=False


@eel.expose
def get_template():
  global current_template
  global template_index

  if ((template_index+1)>len(templates)):
    eel.end() 
  else:
    try:
      f = open(templates[template_index], encoding='utf8')
      data = json.load(f)
      current_template=data
      f.close()
    except:
      print("Error obrint el template#",template_index)
    return data

@eel.expose
def process_template(data):
  global current_template
  data=json.loads(data)
  print("")
  print("Process template:::::::::::::::")
  print(data)
  #print(current_template)
  if "res" in data:
    #its a classic template with options
    candidates=data["res"]
  else:
    candidates=1
  res=GPT.processBlocks(current_template,data,int(candidates),eel)
  print(res)
  #template_index+=1
  eel.res_finished(res)
  return res

@eel.expose
def save_page(data):
  global template_index
  #data = json.loads(data)
  head, tail = os.path.split(templates[template_index])
  filename=tail

  data["template"]=filename.split(".")[0]
  with open('output/'+tail, 'w') as f:
    json.dump(data, f)

  template_index+=1

#audio functions:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
@eel.expose
def start_audio_transcription():
  global recorder
  recordthread = Thread( target=recorder.rec_realTime, args=(eel,GPT,"es","es","Whisper") )
  recordthread.start()
  #recorder.rec_realTime(eel,GPT,"es","es","Whisper")

@eel.expose
def change_recording_state(state):
    global recorder
    recorder.recording_action=state

eel.init('frontend')
eel.start('index.html')


