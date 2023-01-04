# gpt-lore-machine

uses Open AI gpt3 API to create stories based on templates

# Requirements
Environment with python 3.6 (conda recomended)
ffmpeg
clone https://github.com/carlitoselmago/MakeItTalk inside "gpt-lore-machine" folder and download models from instructions
create a symlink src pointing to MakeitTalk/src
create a symlink examples pointing to MakeitTalk/examples

# Install

first clone MakeItTalk repo and create its conda env

then:
(Windows)
create conda env from file 
onda create  --file environment.yml
conda activate makeittalk_env

# How to use
Create templates inside the folder /templates, the "blocks" section is used to build the frontend with info and inputs
The "process" section defines the structure to build the final prompt

Create the templates in alfabetical order to control when they show up

Content generated will be dumped inside /output folder

run 
```
python main.py
```


# Avatar
run
```
python create-video.py --audio audio.wav --image image.png
```