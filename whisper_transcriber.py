from lib.gpt import GPT
GPT=GPT()
import pyaudio
import requests
import json



# Audio settings
CHUNK = 1024
FORMAT = pyaudio.paInt16
CHANNELS = 1
RATE = 16000

# Initialize PyAudio
audio = pyaudio.PyAudio()

# Start streaming
stream = audio.open(format=FORMAT, channels=CHANNELS, rate=RATE, input=True, frames_per_buffer=CHUNK)

print("Listening...")

while True:
    try:
        # Record audio in chunks
        data = stream.read(CHUNK)

        # Transcribe audio using OpenAI Whisper ASR API
        response = GPT.transcribe(data,RATE,CHANNELS)#openai.Audio.transcribe(data, sample_rate_hertz=RATE, encoding='LINEAR16', num_channels=CHANNELS)

        if response.get("choices"):
            transcript = response["choices"][0]["text"]
            print(f"Transcript: {transcript}")
        else:
            print("No transcript available.")

    except KeyboardInterrupt:
        print("Stopping transcription...")
        break
    except Exception as e:
        print(f"Error: {e}")
        break

# Stop and close the stream and audio
stream.stop_stream()
stream.close()
audio.terminate()

"""
This script uses the `pyaudio` library to capture live audio from your microphone. If you don't have the library, you can install it using:

```bash
pip install pyaudio
```

Make sure your OpenAI API key is set correctly in the script. The script captures audio in chunks and sends them to the Whisper ASR API for transcription. The transcribed text is then printed in the console.

Please note that the OpenAI Whisper ASR API is in beta, and the API may change in the future. Also, the example script provided is a
"""
