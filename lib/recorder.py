
import pyaudio  
from time import sleep
import sounddevice as sd
import audioop
from typing import Literal, List
from datetime import datetime, timedelta
import threading
from multiprocessing import Queue
import io
import wave
from time import sleep, time
import os
import sys
import json

class recorder:

    #device_id=1 #this needs to be set based on the machine

    mic_maxBuffer= 15
    speaker_maxBuffer= 10
    mic_energy_threshold= 600
    speaker_energy_threshold= 5000
    enable_threshold= True
    debug_energy= False
    transcribe_rate= 500#500
    sample_rate= 16000
    chunk_size= 1024
    max_sentences= 1
    max_temp= 200
    auto_sample_rate=False
    auto_channels_amount= False
    keep_temp= False
    compression_ratio_threshold=2.4
    logprob_threshold= -1.0
    no_speech_threshold= 0.6
    condition_on_previous_text= True
    initial_prompt= "" 
    temperature= "0.0, 0.2, 0.4, 0.6, 0.8, 1.0"

    separate_with= "||"#"&#10;"#"\\n"

    dir_temp="tmp"
    recording=False

    #controls the state of transcription recording process
    recording_action="recording"
   
    data_queue = Queue()

    def __init__(self):
        pass

    def getDeviceAverageThreshold(self,deviceType= "mic", duration: int = 5) -> float:
        """
        Function to get the average threshold of the device.
        Parameters
        ----
        deviceType: "mic" | "speaker"
            Device type
        duration: int
            Duration of recording in seconds
        Returns
        ----
        float
            Average threshold of the device
        """
        p = pyaudio.PyAudio()

        
        device = "mic"

        # get the device id from sounddevice module
        device_id = self.device_id#sd.query_devices(device, "input")["index"]  # type: ignore
        device_detail = p.get_device_info_by_index(int(device_id))  # Get device detail
        num_of_channels = 1

        sample_rate =self.sample_rate
        num_of_channels = 1

        # get data from device using pyaudio
        data = b""

        def callback(in_data, frame_count, time_info, status):
            nonlocal data
            data += in_data
            return (in_data, pyaudio.paContinue)

        chunk_size = self.chunk_size
        stream = p.open(format=pyaudio.paInt16, channels=num_of_channels, rate=sample_rate, input=True, frames_per_buffer=chunk_size, input_device_index=int(device_detail["index"]), stream_callback=callback)

        stream.start_stream()

        while stream.is_active():
            sleep(0.1)
            if len(data) > sample_rate * duration * 2:
                break

        stream.stop_stream()
        stream.close()
        p.terminate()

        # get average threshold
        avg_threshold = audioop.rms(data, 2)  # type: ignore

        print("avg_threshold",avg_threshold)

        return avg_threshold
    
    def rec_realTime(self,
                    
                     eel,
                     GPT,
        lang_source: str,
        engine: Literal["Whisper", "Google", "LibreTranslate", "MyMemoryTranslator"],
        transcribe= True,
        translate= False,
        speaker: bool = False,
    ) -> None:
       
        pa = pyaudio.PyAudio()
        device=pa.get_default_input_device_info()
        device_id=device["index"]
        print(device)

        src_english = lang_source == "english"
        auto = lang_source == "auto detect"
        whisperEngine = engine == "Whisper"

        # read from settings
        sample_rate = self.sample_rate
        chunk_size = self.chunk_size
        max_sentences = self.max_sentences
        max_int16 = 2**15
        separator = self.separate_with

        # recording session init
        global prev_tl_text, sentences_tl
        tempList = []
        sentences_tc = []
        sentences_tl = []
        prev_tc_text = ""
        prev_tl_text = ""
        next_transcribe_time = None
        last_sample = bytes()
        transcribe_rate = timedelta(seconds=self.transcribe_rate / 1000)
        max_record_time = int(self.speaker_maxBuffer) if speaker else int(self.mic_maxBuffer)
        task = "translate" if whisperEngine and translate and not transcribe else "transcribe"  # if only translate to english using whisper engine

        # load model ::::::::::::::::::::::::::::::::::::::::::::::::::
        

        # ----------------- Start recording -----------------
       

        # pyaudio
        p = pyaudio.PyAudio()

        if speaker:
            # get the device id in [ID: x]
            device_id = device.split("[ID: ")[1]  # first get the id bracket
            device_id = device_id.split("]")[0]  # then get the id

            # Get device detail
            device_detail = p.get_device_info_by_index(int(device_id))

            if not device_detail["isLoopbackDevice"]:
                for loopback in p.get_loopback_device_info_generator():  # type: ignore
                    """
                    Try to find loopback device with same name(and [Loopback suffix]).
                    Unfortunately, this is the most adequate way at the moment.
                    """
                    if device_detail["name"] in loopback["name"]:
                        device_detail = loopback
                        break
                else:
                    # raise exception
                    raise Exception("Loopback device not found")

            # speaker will automatically use the max sample rate and channels, because it won't work if not set like this
            num_of_channels = int(device_detail["maxInputChannels"])
            sample_rate = int(device_detail["defaultSampleRate"])
          
        else:
            # get the device id from sounddevice module
            #device_id = device_id#sd.query_devices(device, "input")["index"]  # type: ignore
            device_detail = p.get_device_info_by_index(int(device_id))  # Get device detail
            num_of_channels = 1

            # check if user set auto for sample rate and channels
            if self.auto_sample_rate:
                sample_rate = int(device_detail["defaultSampleRate"])
            if self.auto_channels_amount:
                num_of_channels = int(device_detail["maxInputChannels"])


        rec_type = "speaker" if speaker else "mic"
        self.stream = p.open(format=pyaudio.paInt16, channels=num_of_channels, rate=sample_rate, input=True, frames_per_buffer=chunk_size, input_device_index=int(device_detail["index"]))
        record_thread = threading.Thread(target=self.realtime_recording_thread, args=[chunk_size, rec_type], daemon=True)
        record_thread.start()

        self.recording=True
        # transcribing thread
        while self.recording:
            #print("recording_action",self.recording_action)
            if self.recording_action=="stop":
                self.recording=False
            if self.recording_action=="recording":
                if not self.data_queue.empty():
                    now = datetime.utcnow()
                    # Set next_transcribe_time for the first time.
                    if not next_transcribe_time:
                        next_transcribe_time = now + transcribe_rate

                    # Only run transcription occasionally. This reduces stress on the GPU and makes transcriptions
                    # more accurate because they have more audio context, but makes the transcription less real time.
                    if now > next_transcribe_time:
                        #print("dale transcribe")
                        next_transcribe_time = now + transcribe_rate

                        # Getting the stream data from the queue.
                        while not self.data_queue.empty():
                            data = self.data_queue.get()
                            last_sample += data

                        # Write out raw frames as a wave file.
                        wav_file = io.BytesIO()
                        wav_writer: wave.Wave_write = wave.open(wav_file, "wb")
                        wav_writer.setframerate(sample_rate)
                        wav_writer.setsampwidth(p.get_sample_size(pyaudio.paInt16))
                        wav_writer.setnchannels(num_of_channels)
                        wav_writer.writeframes(last_sample)  # get the audio data from the buffer.
                        wav_writer.close()

                        # Read the audio data
                        wav_file.seek(0)
                        wav_reader: wave.Wave_read = wave.open(wav_file)
                        samples = wav_reader.getnframes()
                        audio = wav_reader.readframes(samples)
                        wav_reader.close()

                        
                        #if num_of_channels > 1:
                        # If not mono, the fast method does not work so we have to resort to using the old, a little slower, but working method
                        # which is to save the audio file and read it directly to the whisper model
                        audio_target = os.path.join(self.dir_temp, datetime.now().strftime("%Y-%m-%d %H_%M_%S_%f")) + ".wav"
                        tempList.append(audio_target)  # add to the temp list to delete later

                        # block until the file is written
                        timeNow = time()
                        with open(audio_target, "wb") as f:
                            f.write(wav_file.getvalue())  # write it
                        timeTaken = time() - timeNow
                        

                        # delete the oldest file if the temp list is too long
                        if len(tempList) > self.max_temp and not self.keep_temp:
                            os.remove(tempList[0])
                            tempList.pop(0)
                        """
                        else:
                            # Convert the wave data straight to a numpy array for the model.
                            # https://stackoverflow.com/a/62298670
                            audio_as_np_int16 = numpy.frombuffer(audio, dtype=numpy.int16)
                            audio_as_np_float32 = audio_as_np_int16.astype(numpy.float32)
                            audio_target = audio_as_np_float32 / max_int16  # normalized as Numpy array
                        """
                        """
                        result = model.transcribe(
                            audio_target,
                            language=lang_source if not auto else None,
                            task=task,
                            temperature=temperature,
                            compression_ratio_threshold=compression_ratio_threshold,
                            logprob_threshold=logprob_threshold,
                            no_speech_threshold=no_speech_threshold,
                            condition_on_previous_text=condition_on_previous_text,
                            initial_prompt=initial_prompt,
                            **whisper_extra_args,
                        )
                        """
                        try:
                            result=GPT.transcribe(audio_target)
                            text = result 
                        except Exception as E:
                            print(E)
                            text=""
                            #audio too short
                    

                        if len(text) > 0 and text != prev_tc_text:
                            prev_tc_text = text
                            if transcribe:
                                # this works like this:
                                # clear the textbox first, then insert the text. The text inserted is a continuation of the previous text.
                                # the longer it is the clearer the transcribed text will be, because of more context.
                            
                        
                                #gClass.clearMwTc()
                                #gClass.clearExTc()
                                toExTc = ""

                                # insert previous sentences if there are any
                                for sentence in sentences_tc:
                                    #gClass.insertMwTbTc(sentence + separator)
                                    toExTc += sentence + separator

                                # insert the current sentence after previous sentences
                                #gClass.insertMwTbTc(text + separator)
                                
                                toExTc += text + separator
                                #gClass.insertExTbTc(toExTc)

                                
                                ######
                                eel.get_transcription(toExTc)
                                eel.puton_transcript_projector(toExTc)
                                ######
                                #HERE WE MANAGE THE NEW HANDLE OF TEXT:::::::::::::::::::::::::::::::::::
                                print("t: ",toExTc)
                                #sys.stdout.write("\033[F") # Cursor up one line
                                #::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

                            if translate:
                                
                                tlThread = threading.Thread(
                                    target=GPT.transcribe,
                                    args=[
                                        audio_target
                                        
                                    ],
                                    daemon=True,
                                )
                                tlThread.start()
                            

                        # break up the buffer If we've reached max recording time
                        audio_length_in_seconds = samples / float(sample_rate)
                        
                        if audio_length_in_seconds > max_record_time:
                            last_sample = bytes()

                            if transcribe:
                                sentences_tc.append(prev_tc_text)
                                
                                #here sentences get popped out, so we need to send a signal to fronted 
                                if len(sentences_tc) >= max_sentences:
                                    toarchive=sentences_tc.pop(0)
                                    eel.archive_transcription(toarchive)

                            if translate:
                                sentences_tl.append(prev_tl_text)
                                if len(sentences_tl) >= max_sentences:
                                    sentences_tl.pop(0)

            sleep(0.1)
        else:
           

            # empty the queue
            while not self.data_queue.empty():
                self.data_queue.get()

            #if num_of_channels > 1 and not self.keep_temp:
            if not self.keep_temp:
                
                for audio in tempList:
                    try:
                        os.remove(audio)
                    except FileNotFoundError:
                        pass
        eel.finished_transcription()
        print("FINISHED RECORDING THREAD")


    def realtime_recording_thread(self,chunk_size: int, rec_type: Literal["mic", "speaker"]):
        print("realtime recording thread")
        """Record Audio From stream buffer and save it to a queue"""
        assert self.stream is not None
        while self.recording:  # Record in a thread at a fast rate.
            if self.recording_action=="recording":
                data = self.stream.read(chunk_size)
                energy = audioop.rms(data, 2)
                #print("energy",energy)
                # store chunks of audio in queue
                if not self.enable_threshold:  # record regardless of energy
                    self.data_queue.put(data)
                
                elif energy > self.mic_energy_threshold and self.enable_threshold:  # only record if energy is above threshold
                    #print("rec")
                    self.data_queue.put(data)
