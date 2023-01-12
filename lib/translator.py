import sys
#disable all warnings
if not sys.warnoptions:
    import warnings
    warnings.simplefilter("ignore")
import torch
from transformers import AutoTokenizer, AutoModelWithLMHead

#from gpt import GPT

#hack to speed up
origin="en"
target="ca"
model="Helsinki-NLP/opus-mt-"+origin+"-"+target #english -> destISO
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
tokenizer = AutoTokenizer.from_pretrained(model)
model = AutoModelWithLMHead.from_pretrained(model).to(device)

def translate(translate_string: str,origin="en",target="ca") -> str:
    #model="Helsinki-NLP/opus-mt-"+origin+"-"+target #english -> destISO
    # Set the device to run on (CPU or GPU)
    #device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    # Download the tokenizer and model for the translation model
    #tokenizer = AutoTokenizer.from_pretrained(model)
    #model = AutoModelWithLMHead.from_pretrained(model).to(device)
   
    # Encode the string to translate and set it to the device
    input_ids = torch.tensor(tokenizer.encode(translate_string, return_tensors='pt')).to(device)

    # Generate the translation
    translation = model.generate(input_ids)[:, tokenizer.bos_token_id:].tolist()
    translation = [tokenizer.decode(g, skip_special_tokens=True) for g in translation]
    
    return "".join(translation)


# Test the function
#print(translate("Mitjons plens de suor","ca","en"))
