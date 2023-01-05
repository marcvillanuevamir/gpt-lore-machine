from lib import ChromaKey
import cv2
import numpy as np
import time

foreground=cv2.imread(r"C:\Users\gamer\Desktop\TMP\tobey.png")
background=cv2.imread(r"C:\Users\gamer\Desktop\TMP\bg.jpg")

#lowestChroma=np.array([159,255,42])
#highestChroma=np.array([170,255,60])

lowestChroma=np.array([30, 30, 0])
highestChroma=np.array([104, 253, 270])

pad_top=48
pad_bottom=165
pad_left=137
pad_right=450

#lowestChroma=np.array([0,0,100])
#highestChroma=np.array([255,12,100])
color = [0, 0, 0]
lowestChroma=np.array([30, 30, 0])
highestChroma=np.array([104, 253, 270])

videoW=256+pad_left+pad_right
videoH=256+pad_top+pad_bottom

foreground = cv2.copyMakeBorder(foreground.copy(),pad_top, pad_bottom, pad_left, pad_right, cv2.BORDER_CONSTANT, value=color)

gs = ChromaKey.ChromaKey((590, 332))
new_frame = gs.chroma_key_image_smooth5(
               foreground,
                background,
                lowestChroma,
                highestChroma)

cv2.imshow("a",new_frame.astype(np.uint8))
done = False;
while not done:
    done = cv2.waitKey(1) == ord('q')
