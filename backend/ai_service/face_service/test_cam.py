import cv2
import os

print("Detecting Cameras...")
for i in range(5):
    cap = cv2.VideoCapture(i, cv2.CAP_DSHOW if os.name == 'nt' else cv2.CAP_ANY)
    if cap.isOpened():
        print(f"Index {i} IS OPEN")
        ret, frame = cap.read()
        if ret:
            print(f"Index {i} CAN READ FRAME")
        else:
            print(f"Index {i} FAILED TO READ")
        cap.release()
    else:
        print(f"Index {i} IS CLOSED")
