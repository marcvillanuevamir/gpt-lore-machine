import os,sys
import openai
import io
from pydub import AudioSegment
import tempfile
import configparser
from lib.recorder import recorder



class GPT:
    
    model="text-davinci-003"
   
    def __init__(self):
        # determine if application is a script file or frozen exe
        if getattr(sys, 'frozen', False):
            print("frozen executable")
            self.application_path = os.path.dirname(sys.executable) 
            print(self.application_path)
        elif __file__:
            print("not frozen")
            self.application_path = ""#os.path.dirname(__file__)
            print(self.application_path)

        config = configparser.ConfigParser()
        config.read(self.getPath('config.ini'))
        openai.api_key = config["OPENAI"]["apikey"]
      

    def init_recorder(self):
        self.recorder=recorder()

    def complete(self,prompt="",temperature=0.9,max_tokens=7):
        r=openai.Completion.create(
            model=self.model,
            prompt=prompt,
            max_tokens=int(max_tokens),
            temperature=temperature
        )
        r_text=r["choices"][0]["text"]
        return r_text.strip()

    def translate(self,translate_string: str,origin="en",target="ca"):

        targetWord="Catalan"

        if origin=="en":
            prompt='Translate this sentence into '+targetWord+'\n '+translate_string+'\n 1.'
        
        if origin=="ca":
            targetWord="English"
            prompt='Translate this catalan sentence into '+targetWord+'\n '+translate_string+'\n 1.'
        print("translate prompt",prompt)
        #print("")
        r=self.complete(prompt,temperature=0.6,max_tokens=len(translate_string)*1.5)
        #print("traduccio",r)
        #print("")
        return r

    def genericProcess(self,structure,inputs):
        H=''
        for p in structure:
            
            if "text" in p:
                H+=p["text"]
            if "input" in p:
                if "before" in p:
                    H+=p["before"]
                txt=inputs[p["input"]]
                if "translate" in p:
                    txt=self.translate(txt,"ca","en")
                H+=txt
                if "after" in p:
                    H+=p["after"]
        return H

    def processBlocks(self,template,inputs,candidates=1,eel=False):
       
        H=''

        if "options" in template["process"][0]:
            print("its an options one")
            selected=int(inputs["options"])
            structure=template["process"][0]["options"][selected]["structure"]
        else:
            print("its a classic template")
            structure=template["process"]
        print("")
        print("structure",structure)
        H+=self.genericProcess(structure,inputs)
        print("")
        print("Prompt template ready::::")
        print(H)

        res=[]

        temp=0.7
        for i in range(candidates):
            temp+=0.1
            if temp>1:
                temp=0.98
            print("")
            print("GPT COMPLETE::::")
            print(":::::::::::::::")
            pred=self.complete(H,temperature=temp,max_tokens=200)
            #r=self.translate(pred,"en","ca")
            r=pred
            #dont wait till the end, send them step by step
            if (candidates==1):
                eel.getRes(r,"textarea")
            else:
                eel.getRes(r,"radio")
            
            res.append(r)
        return res

    def transcribe(self,audio_file):
        #print("gonna transcribe")
        model="whisper-1"
        
        """
        # Create a temporary file to store the binary data
        with tempfile.NamedTemporaryFile(suffix='.wav', mode='wb', delete=False) as temp_file:
            temp_file.write(data)
            temp_file.flush()
        """
        """
        # Save the audio data to a file
        audio_file_name = "audio.wav"
        with open(audio_file_name, 'wb') as audio_file:
            audio_file.write(data)

        # Convert audio format to MP3
        audio_file_mp3="audio.mp3"
        audio = AudioSegment.from_wav(audio_file_name)
        audio.export(audio_file_mp3, format="mp3")
        """
        # Transcribe audio using OpenAI Whisper ASR API
        with open(audio_file, 'rb') as data_file:
            response = openai.Audio.transcribe(model,data_file)
            #print("response",response["text"])
            return response["text"]
            if response.get("choices"):
                transcript = response["choices"][0]["text"]
                print(f"Transcript: {transcript}")
                return transcript
            else:
                print("No transcript available.")
        
        # Delete the original WAV file
        #os.remove(audio_file_name)



    def getPath(self,filename):
        actualpath = os.path.join(self.application_path, filename)
        return actualpath