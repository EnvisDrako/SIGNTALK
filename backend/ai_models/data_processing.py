import numpy as np

def normalize_mediapipe_coordinates(keypoints_json):
    """"
    Normalizes a sequence of MediaPipe Holistic JSON payloads.
    - Centers the coordinates relative to the chest.
    - Scales the sequence based on shoulder-to-shoulder distance to 1.0.
    """
    # Placeholder logic
    # Real implementation would parse 'pose_landmarks', 'left_hand_landmarks', etc.
    # Center = midpoint between left_shoulder and right_shoulder
    # Scale = Euclidean distance between left_shoulder and right_shoulder
    
    normalized_sequence = []
    
    # Example parsing over frames
    for frame in keypoints_json:
        # 1. Extract raw arrays
        # 2. Find shoulder center
        # 3. Translate all coordinates by subtracting center
        # 4. Find shoulder distance
        # 5. Divide all coordinates by shoulder distance
        normalized_sequence.append(frame) # append normalized frame array
        
    return np.array(normalized_sequence)
