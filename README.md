# gpt-lore-machine

uses Open AI gpt3 API to create stories based on templates

# Requirements
Environment with python 3.7 (conda recomended)

# Install
run 
```
pip install -r requirements.txt
```

# How to use
Create templates inside the folder /templates, the "blocks" section is used to build the frontend with info and inputs
The "process" section defines the structure to build the final prompt

Create the templates in alfabetical order to control when they show up

Content generated will be dumped inside /output folder

run 
```
python main.py
```