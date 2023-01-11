import eel
import os
import glob
import json
import pygame
from pygame import mixer
import time
from lib.translator import *



def sendData(data):
    print("sEND DATA")
    print(data)
    eel.showtext(data)

@eel.expose
def sendtoprojector(data):

    cat=translate(data["en"])
    data["cat"]=cat
    sendData(data)
    audiofile="frontend/audios/"+data["audio"]+".mp3"
    mixer.init()
    mixer.music.load(audiofile)
    pygame.mixer.music.set_volume(0.5)
    mixer.music.play()
    #time.sleep(10)
   

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
