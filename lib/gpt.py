import os
import openai
import configparser
config = configparser.ConfigParser()
config.read('config.ini')
openai.api_key = config["OPENAI"]["apikey"]


class GPT:
    
    model="text-davinci-003"
   
    def __init__(self):
        pass 

    def complete(self,prompt="",temperature=0.8,max_tokens=7):
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

    def processBlocks(self,template,inputs,candidates=1,eel=False):
       
        H=''
        for p in template["process"]:
            
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
        print("")
        print("Prompt template ready::::")
        print(H)

        res=[]

        temp=0.7
        for i in range(candidates):
            temp+=0.1
            if temp>1:
                temp=0.98
            pred=self.complete(H,temperature=temp,max_tokens=200)
            r=self.translate(pred,"en","ca")
            #dont wait till the end, send them step by step
            eel.getRes(r)
            
            res.append(r)
        return res
