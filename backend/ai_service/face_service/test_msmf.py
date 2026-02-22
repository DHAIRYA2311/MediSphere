import cv2
import os

print("Detecting Cameras with MSMF...")
for i in range(5):
    cap = cv2.VideoCapture(i, cv2.CAP_MSMF)
    if cap.isOpened():
        print(f"Index {i} IS OPEN (MSMF)")
        ret, frame = cap.read()
        if ret:
            print(f"Index {i} CAN READ FRAME")
        else:
            print(f"Index {i} FAILED TO READ")
        cap.release()
    else:
        print(f"Index {i} IS CLOSED (MSMF)")
