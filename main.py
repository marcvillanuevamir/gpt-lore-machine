import eel
import os
import glob
import json
from gpt import GPT
GPT=GPT()

templates=glob.glob("templates/*.json")
template_index=0
current_template=False

@eel.expose
def get_template():
  global current_template
  global template_index
  f = open(templates[template_index], encoding='utf8')
  data = json.load(f)
  current_template=data
  f.close()
  return data
  

@eel.expose
def process_template(data):
  global current_template
  data=json.loads(data)
  print("")
  print("Process template:::::::::::::::")
  print(data)
  #print(current_template)
  candidates=data["res"]
  res=GPT.processBlocks(current_template,data,int(candidates),eel)
  print(res)
  #template_index+=1
  return res

eel.init('frontend')
eel.start('index.html')


