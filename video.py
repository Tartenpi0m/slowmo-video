import cv2
import numpy as np


def normalize(frame):
    return (frame - float(np.min(frame))) / float(np.max(frame) - np.min(frame))


        

class Video():

    def __init__(self, filename):
        try: self.capture = cv2.VideoCapture(filename) 
        except: raise FileNotFoundError(f"Filename {filename} not found")

        self.total_frame = self.capture.get(cv2.CAP_PROP_FRAME_COUNT)
        self.width = self.capture.get(cv2.CAP_PROP_FRAME_WIDTH)
        self.height = self.capture.get(cv2.CAP_PROP_FRAME_HEIGHT)
        self.rotation = 0

    def get_property(self):
        return self.width, self.height, self.total_frame
            
    def read_frame(self, n):
        self.capture.set(cv2.CAP_PROP_POS_FRAMES, n)
        success, frame = self.capture.read()

        if success: return self.process_frame(frame)
        else: raise Exception(f"Frame {n} does not exist")

    def process_frame(self, frame: np.ndarray):
        # frame = normalize(frame)[:,:,0]
        frame = frame[:,:,0]
        if self.rotation == 1:
            frame = frame.swapaxes(1, 0)
        elif self.rotation == 2:
            frame = np.fliplr(frame)
        elif self.rotation == 3:
            frame = np.flipud(frame.swapaxes(1, 0))
        
        return frame

