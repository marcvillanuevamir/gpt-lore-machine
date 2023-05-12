import eel
import os
import glob
import json
from lib.recorder import recorder
from lib.gpt import GPT
from threading import Thread
import multiprocessing
import sys
import xml.etree.ElementTree as ET

#helpers
def loadXMLtoObject(uri):
    tree = ET.parse(uri)
    root = tree.getroot()
    data = []

    for elem in root:
        elem_dict = {}
        for attr in elem:
            elem_dict[attr.tag] = attr.text
        data.append(elem_dict)

    return data

if __name__=='__main__':
  multiprocessing.freeze_support()

  GPT=GPT()
  recorder=recorder()

  templates=glob.glob("templates/*.xml")
  templates.sort()
  print(templates)
  template_index=0
  current_template=False



  # determine if application is a script file or frozen exe
  if getattr(sys, 'frozen', False):
      print("frozen executable")
      application_path = os.path.dirname(sys.executable) 
      print(application_path)
  elif __file__:
      print("not frozen")
      application_path = ""#os.path.dirname(__file__)
      print(application_path)

  def getPath(filename):
      actualpath = os.path.join(application_path, filename)
      return actualpath

  @eel.expose
  def get_template():
    global current_template
    global template_index

    if ((template_index+1)>len(templates)):
      eel.end() 
    else:
      try:
        #f = open(getPath(templates[template_index]), encoding='utf8')
        #data = json.load(f)
        data=loadXMLtoObject(getPath(templates[template_index]))
        print("data",data)
        current_template=data
        #f.close()
      except Exception as e:
        print("Error obrint el template#",template_index,e)
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
    head, tail = os.path.split(getPath(templates[template_index]))
    filename=tail

    data["template"]=filename.split(".")[0]
    with open(getPath('output/'+tail), 'w') as f:
      json.dump(data, f)

    template_index+=1

  @eel.expose
  def init_transcription_projector():
    eel.show('transcript_projector.html')

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



  #chat functions::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  chatsystem=""
  chatengine=""
  chathistory=[]

  assistant_response=""

  def handleChatchunk(chunk):
    global assistant_response,chatsystem,chatengine,chathistory
    if "END" in chunk:
       eel.endchat()
       chunk=chunk.replace('END', '')
    if chunk=="<STOP>":
      chathistory.append({"role":"assistant","content":assistant_response})
      assistant_response=""
    else:
      assistant_response+=chunk
    eel.recieveChatStream(chunk)

  @eel.expose
  def startChat(system,engine):
    eel.startchat();
    global chatsystem,chatengine,chathistory
    print("CHAT STARTED!")
    #inits and shows the chat interface
    chatsystem=system;
    chatengine=engine;
    chathistory=[];
  
  @eel.expose
  def sendprompt(prompt):
    global chatsystem,chatengine,chathistory
    print("sendprompt",prompt)
    chathistory.append({"role":"user","content":prompt})
    print("chathistory",chathistory)
    GPT.chat2(handleChatchunk,chathistory,chatsystem,chatengine)


  eel.init('frontend')
  #eel.show('transcript_projector.html')
  eel.show('index.html')
  eel.start('projector.html',position=(200,20),cmdline_args=['--autoplay-policy=no-user-gesture-required'])



