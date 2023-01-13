import eel
import os
import glob
import json
import pygame
from pygame import mixer
import time
from lib.translator import *
import threading
from datetime import datetime
from lib.gpt import GPT
GPT=GPT()

#settings
waittillspeak=0#in seconds

def translateChain(blocks,voice,timest):
    
    #time.sleep(waittillspeak)
    tmp=[]
    for i,b in enumerate(blocks):
        if len(b.strip())>0:
            #cat=translate(b)

            #fix some problematic prompts
            replacements=[
                [":","."]
            ]
            for r in replacements:
                if r[0] in b:
                    b.replace(r[0],r[1])
            cat=GPT.translate(b)
            data={"cat":cat,"en":b,"voice":voice};
            sendData(data,i,timest)
            tmp.append(data)
    print("")
    print("END, ALL BLOCKS")
    print(tmp)

def sendData(data,i,timest):
    print("sEND DATA")
    print(data)
    #eel.showtext(data)
    eel.addtext(data,i,timest)

@eel.expose
def stopProjector():
    print("STOP PROJECTOR")
    eel.endProjection()
    pygame.mixer.music.fadeout(3000)

@eel.expose
def sendtoprojector(data):
    timest=datetime.timestamp(datetime.now())
    try:
        mixer.music.stop()
    except:
        pass
    eel.preStartProjector(timest)
    audiofile="frontend/audios/"+data["audio"]+".mp3"
    mixer.init()
    mixer.music.load(audiofile)
    pygame.mixer.music.set_volume(0.3)
    mixer.music.play()
    
    #process text in blocks
    textBlocks=data["en"].splitlines( )
    x = threading.Thread(target=translateChain, args=(textBlocks,data["voice"],timest))
    time.sleep(0.1)
    x.start()

    #cat=translate(data["en"])
    #data["cat"]=cat
    #time.sleep(waittillspeak)
    #sendData(data)

#scan audios and send them to control
audios=glob.glob("frontend/audios/*.mp3")

@eel.expose
def getaudios():
    p_audios=[]
    for a in audios:
        head, tail = os.path.split(a)
        filename=tail
        audio=filename.split(".")[0]
        p_audios.append(audio)
    print("get audios",p_audios)
    eel.recieveAudios(p_audios)

eel.init('frontend')
eel.show('projector_control.html')
eel.start('projector.html',position=(200,20),cmdline_args=['--autoplay-policy=no-user-gesture-required'])

