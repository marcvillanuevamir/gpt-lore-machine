import cv2
import numpy as np


class MaskedImage:
    def __init__(self, mask, image):
        self.mask = mask
        self.image = image


class ChromaKey:
    def __init__(self, video_size):
        self.signal_width, self.signal_height = video_size

    def __process_foreground_image(self, frame, lower_green, upper_green):
        """Create an image mask to change green pixels to black on the foreground image"""
        img = np.copy(frame)

        mask = cv2.inRange(img, lower_green, upper_green)

        masked_image = np.copy(img)
        #masked_image[mask != 0] = [0, 0, 0]

        kernel = np.ones((3,3), np.uint8)
        masked_image = cv2.dilate(masked_image, kernel, iterations = 1)
        masked_image = cv2.medianBlur(masked_image, 5)
        #masked_image = cv2.bitwise_not(masked_image)

        #masked_image[mask != 0] = [0, 0, 0]
        crop = np.zeros_like(img)
        
        return MaskedImage(mask, masked_image)

    def __process_background_image(self, background_frame, mask):
        """Create another image mask to turn non-green pixels black on the background image"""
        background_image = cv2.cvtColor(background_frame, cv2.COLOR_BGR2RGB)

        crop_background = cv2.resize(background_image,
                                     (self.signal_width,
                                      self.signal_height))
     
        crop_background[mask == 0] = img[mask == 0]

        #crop_background[mask == 0] = [0, 0, 0]
        return crop_background

    def chroma_key_image(self, frame, background_image, lower_green=None, upper_green=None):
        """Chroma key image method."""
        lower_green = lower_green if lower_green is not None else ([0, 100, 0])
        upper_green = upper_green if upper_green is not None else ([80, 255, 40])

        if frame is None or background_image is None:
            raise RuntimeError("Foreground or background image is null.")

        cv2.normalize(frame, frame, 0, 255, cv2.NORM_MINMAX)
        foreground = self.__process_foreground_image(frame, lower_green, upper_green)
        background = self.__process_background_image(background_image, foreground.mask)

        return np.array(foreground.image + background)

    def chroma_key_image_smooth(self, frame, background_image, lower_green=None, upper_green=None):
        #background_image = cv2.cvtColor(background_image, cv2.COLOR_BGR2RGB)
        # resize
        img = frame.copy()

        # change to hsv
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        h,s,v = cv2.split(hsv)

        # get uniques
        unique_colors, counts = np.unique(s, return_counts=True);

        # sort through and grab the most abundant unique color
       
        big_color = None
        biggest = -1
        for a in range(len(unique_colors)):
            if counts[a] > biggest:
                biggest = counts[a]
                big_color = int(unique_colors[a])
      

        # get the color mask
        margin = 50
        #mask = cv2.inRange(s, lower_green, upper_green)
        mask = cv2.inRange(s, big_color - margin, big_color + margin);

        # smooth out the mask and invert
        kernel = np.ones((3,3), np.uint8);
        mask = cv2.dilate(mask, kernel, iterations = 1);
        mask = cv2.medianBlur(mask, 5);
        #mask = cv2.bitwise_not(mask);

        # crop out the image
        crop = np.zeros_like(img);
        crop[mask == 255] = img[mask == 255];

        #return np.array(MaskedImage(img,background_image).image+crop )
        #res= cv2.cvtColor(np.array(img+background_image), cv2.COLOR_BGR2BGRA)
        #res[:, :, 3] =crop
        # Multiply the background with ( 1 - alpha )
        mask = mask.astype(float)/255
        background_image = cv2.multiply(1.0 - mask.astype(float), background_image.astype(float))
        
        res=(background_image+crop)
        """
        print("")
        print("DTYPES!")
        print(crop.dtype)
        print(background_image.dtype)
        """
        #masked_background_image= cv2.add(res, background_image.astype(np.float32))
        #masked_background_image= cv2.add(res.astype(np.uint8), background_image)
        #masked_background_image= cv2.add(crop.astype(np.uint8), background_image)
        #masked_background_image = cv2.bitwise_and(background_image, cv2.bitwise_not(crop.astype(np.uint8)))
        #masked_background_image = cv2.bitwise_and(background_image, cv2.bitwise_not(crop.astype(np.uint8)))
        masked_background_image=(cv2.add(crop,background_image))/255
        return masked_background_image#masked_background_image

    #def chroma_key_image_smooth2(self, frame, background_image, lower_green=None, upper_green=None):
    def chroma_key_image_smooth2(self,foreground_image, background_image, lower_green=None,upper_green=None):
        key_color=lower_green


        # Convert the images to the HSV color space
        foreground_image_hsv = cv2.cvtColor(foreground_image, cv2.COLOR_RGB2HSV)
        background_image_hsv = cv2.cvtColor(background_image, cv2.COLOR_RGB2HSV)

        # Create a mask for the foreground image
        #mask = cv2.inRange(foreground_image_hsv, np.array(key_color[0]), np.array(key_color[1]))
        mask = cv2.inRange(foreground_image_hsv, lower_green, upper_green)

        # Create a 3 channel mask for the foreground image
        foreground_image_mask = cv2.cvtColor(mask, cv2.COLOR_GRAY2RGB)

        # Create a masked version of the foreground image
        masked_foreground_image = cv2.bitwise_and(foreground_image_hsv, foreground_image_mask)

        # Create a masked version of the background image
        masked_background_image = cv2.bitwise_and(background_image, cv2.bitwise_not(foreground_image_mask))

        # Combine the masked foreground and background images
        combined_image = cv2.add(masked_foreground_image.astype(np.uint8), masked_background_image.astype(np.uint8))

        # Convert the image back to the BGR color space
        combined_image = cv2.cvtColor(combined_image, cv2.COLOR_RGB2BGR)

        return combined_image

    def chroma_key_image_smooth3(self,foreground_image, background_image, lower_green=None,upper_green=None):

        # Convert the images to the HSV color space
        foreground_hsv = cv2.cvtColor(foreground_image, cv2.COLOR_RGB2HSV)
        background_hsv = cv2.cvtColor(background_image, cv2.COLOR_RGB2HSV)

        # Create mask of key color in foreground image
        mask = cv2.inRange(foreground_hsv, lower_green,upper_green)

        #Smooth the mask using a median blur
        mask = cv2.medianBlur(mask, 5)

        #Invert the mask
        mask = cv2.bitwise_not(mask)

        #Use the mask to select the foreground image
        fg_masked = cv2.bitwise_and(foreground_hsv, foreground_hsv, mask=mask)

        #Use the mask to select the background image
        bg_masked = cv2.bitwise_and(background_hsv, background_hsv, mask=mask)

        #Combine the masked foreground and background images
        combined = cv2.add(fg_masked.astype(np.uint8), bg_masked.astype(np.uint8))

        #Return the combined image in RGB format
        return cv2.cvtColor(combined, cv2.COLOR_BGR2RGB)

    def chroma_key_image_smooth4(self,foreground_image, background_image, lower_green=None,upper_green=None):
        key_color=lower_green
        # convert both the images to hsv format
        foreground = foreground_image#cv2.cvtColor(foreground_image, cv2.COLOR_BGR2HSV)
        background = cv2.cvtColor(background_image, cv2.COLOR_BGR2HSV)
        
        # define the color range for the chroma key
        lower_color_range = np.array([key_color[0] - 10, key_color[1] - 10, key_color[2] - 10])
        upper_color_range = np.array([key_color[0] + 10, key_color[1] + 10, key_color[2] + 10])
        
        # create a mask for the foreground image
        mask = cv2.inRange(foreground, lower_green,upper_green)
        
        # apply a gaussian blur to the mask
        mask = cv2.MedianBlur(mask, (5, 5), 0)
        
        mask = cv2.bitwise_not(mask)
        # apply the mask to the foreground image
        foreground_masked = cv2.bitwise_and(foreground, foreground, mask = mask)
        
        # apply the mask to the background image
        background_masked = cv2.bitwise_and(background, background, mask = mask)
        
        # combine the foreground and background images
        
        combined_image = cv2.add(foreground_masked, background_masked.astype(np.float32))
        
        # convert the combined image back to BGR
        combined_image = cv2.cvtColor(combined_image, cv2.COLOR_HSV2BGR)
        
        # return the combined image
        return np.array(combined_image)




        return combined_image


    def chroma_key_image_smooth5(self, foreground_image_or, background_image, lower_green=None, upper_green=None):
        
        foreground_image=foreground_image_or.copy()
        #print("foreground_image.dtype",foreground_image.dtype)
        #print("foreground_image.shape",foreground_image.shape)
        foreground_hsv = cv2.cvtColor(foreground_image, cv2.COLOR_RGB2HSV)
        h,s,v = cv2.split(foreground_hsv);

         # get uniques
        unique_colors, counts = np.unique(s, return_counts=True)
        big_color = None;
        biggest = -1;
        for a in range(len(unique_colors)):
            if counts[a] > biggest:
                biggest = counts[a];
                big_color = int(unique_colors[a])

        margin = 10
        alpha = cv2.inRange(s, big_color-margin, big_color+margin);

        #alpha = cv2.inRange(foreground_image, lower_green,upper_green)
        alpha=cv2.cvtColor(alpha,cv2.COLOR_GRAY2RGB)
        kernel = np.ones((3,3), np.uint8)
       
        alpha =cv2.dilate(alpha , kernel, iterations =4)
        alpha = cv2.GaussianBlur(alpha, (5, 5), 0)
        #alpha = cv2.erode(alpha, kernel, iterations = 2)
        alpha =cv2.dilate(alpha , kernel, iterations = 1)
        
        
        
        alpha = cv2.bitwise_not(alpha)
        """
        cv2.imshow("a",alpha)
        done = False;
        while not done:
            done = cv2.waitKey(1) == ord('q')
        """
        # Convert uint8 to float
        foreground = foreground_image.astype(float)
        background = background_image.astype(float)
       
        # Normalize the alpha mask to keep intensity between 0 and 1
        alpha = alpha.astype(float)/255.0
        #print(alpha.shape)
        #print(foreground.shape)
        # Multiply the foreground with the alpha matte
        foreground = cv2.multiply(alpha, foreground)
        
        # Multiply the background with ( 1 - alpha )
        background = cv2.multiply(1.0 - alpha, background)
        
        # Add the masked foreground and background.
        outImage = cv2.add(foreground, background)
        """
        cv2.imshow("a",outImage/255)
        done = False;
        while not done:
            done = cv2.waitKey(1) == ord('q')
        """
        
        return outImage#/255