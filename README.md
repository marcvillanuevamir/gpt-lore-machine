# gpt-lore-machine

uses Open AI gpt3 to create stories based on templates

# Requirements
conda env with python 3.7

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