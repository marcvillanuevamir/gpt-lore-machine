from lib.recorder import recorder
from lib.gpt import GPT
GPT=GPT()

recorder=recorder()

#threshold=recorder.getDeviceAverageThreshold()
#print("threshold",threshold)

recorder.rec_realTime(GPT,"es","es","Whisper")