import os
import pandas as pd
import pickle
import numpy as np
from flask_restful import Resource
from sklearn.cluster import KMeans
from flask import request
from scipy.spatial.distance import pdist, squareform
from scipy.cluster.hierarchy import linkage, leaves_list
import umap

class CosineResource(Resource):
    def __init__(self):
        self.topics = [
            "arts", "science", "career", "family", "intelligence", "appearance",
            "male-nouns", "female-nouns", "male-person-names", "female-person-names",
            "male-pronouns", "female-pronouns", "male-stereotypes", "female-stereotypes",
            "negative-characteristics", "positive-characteristics",
            "richest-countries", "poorest-countries", "weak", "strong"
        ]
        self.topic_indices = {topic: i for i, topic in enumerate(self.topics)}
        self.topic_pairs = [
            ["arts", "science"],
            ["career", "family"],
            ["intelligence", "appearance"],
            ["male-nouns", "female-nouns"],
            ["male-person-names", "female-person-names"],
            ["male-pronouns", "female-pronouns"],
            ["male-stereotypes", "female-stereotypes"],
            ["negative-characteristics", "positive-characteristics"],
            ["richest-countries", "poorest-countries"],
            ["weak", "strong"]
        ]

        self.topic_idx = {
            "arts": 0, "science": 1,
            "career": 2, "family":3,
            "intelligence": 4, "appearance": 5,
            "male nouns": 6, "female nouns": 7,
            "male names": 8, "female names": 9,
            "male pronouns": 10, "female pronouns": 11,
            "male stereotypes": 12, "female stereotypes": 13,
            "negative characteristics": 14, "positive characteristics":15,
            "richest countries":16, "poorest countries":17,
            "weak":18, "strong":19
        }

        self.topic_labels = [f"{concept1}-{concept2}" for (concept1, concept2) in self.topic_pairs]
        self.cosine_map = {}

    def extract_concepts(self, file_name):
        try:
            concepts = file_name.split('__')[0]
            concept1 = concepts.split('_')[0]
            concept2 = concepts.split('_')[1]
            return concept1, concept2
        except ValueError:
                return {"error": "Filename is in incorrect format"}

    def extract_anchors(self, file_name):
        try:
            anchors = file_name.split('__')[1]
            anchor1 = anchors.split('_')[0]
            anchor2 = anchors.split('_')[1]
            return anchor1, anchor2
        except ValueError:
                return {"error": "Filename is in incorrect format"}

    def weat(self):
        # Extract WEAT scores
        weat_data = {}
        for model, model_data in self.cosine_map.items():
            weat_data[model] = {}
            for target_pair in self.topic_pairs: # loop through each target pair X, Y
                for attribute_pair in self.topic_pairs: # loop through attribute pairs A, B
                    if target_pair == attribute_pair:
                        continue
                    X, Y = target_pair
                    A, B = attribute_pair
                    X_data, Y_data = model_data[X], model_data[Y]
                    
                    # Compute s(w, A, B) = sim(w, A) - sim(w, B) for all words in X and Y
                    s_x = [X_data[concept][A] - X_data[concept][B] for concept in X_data]
                    s_y = [Y_data[concept][A] - Y_data[concept][B] for concept in Y_data]

                    # Compute Effect Size (ES)
                    mean_s_x = np.mean(s_x)
                    mean_s_y = np.mean(s_y)
                    std_dev = np.std(s_x + s_y, ddof=1)  # Standard deviation over X ∪ Y

                    ES = (mean_s_x - mean_s_y) / std_dev if std_dev > 0 else 0
                    key = f"{X}|{Y}|{A}|{B}" # use a string key becuase JSON keys can't be tuples
                    weat_data[model][key] = ES
        return weat_data

    def filter_weat(self, threshold, weat_data):
        return {
            model: {
                key: value for key, value in model_data.items() if abs(value) > threshold
            } for model, model_data in weat_data.items()
        }
    
    def get_model_distance_matrix(self, filtered_weat_data):
        models = list(filtered_weat_data.keys())
        all_keys = set(key for model in filtered_weat_data for key in filtered_weat_data[model])

        vectors = []
        for model in models:
            vector = [filtered_weat_data[model].get(key, 0) for key in all_keys]
            vectors.append(vector)

        # compute cosine distance (1-cosine similarity)
        if np.all(np.array(vectors) == 0):
            return np.array([]) # return empty distance matrix if all vectors are zero
        distance_matrix = squareform(pdist(vectors, metric="cosine"))
        return distance_matrix

    def UMAP(self, distance_matrix):
        umap_model = umap.UMAP(n_components=2)
        umap_result = umap_model.fit_transform(distance_matrix)
        return umap_result
    
    # def default_coords(self):
    #     rows = 3
    #     cols = 11

    #     # Create spaced x-values starting 1 before and ending 1 after the grid range
    #     x = np.linspace(-1, cols, cols) 
        
    #     # Repeat the x-values for each row
    #     x = np.tile(x, rows)
        
    #     # Create y-values that repeat for each row
    #     y = np.repeat(np.linspace(0, rows - 1, rows) * 0.8, cols)

    #     # Combine x and y to form coordinates for each item
    #     coordinates = np.vstack((x, y)).T
    #     return coordinates
    def default_coords(self, width=4, height=6, padding=0.3, num_models=33):
        rows = 4
        cols = 9

        # Compute spacing
        x_spacing = width / (cols + (cols - 1) * padding)
        y_spacing = height / (rows + (rows - 1) * padding)

        # Shift x-coordinates left to center the layout
        x_offset = -(width / 2)  # Shift half of the width to center

        # Compute positions
        x = np.array([(i % cols) * x_spacing * (1 + padding) + x_offset for i in range(rows * cols)])
        y = np.array([(i // cols) * y_spacing * (1 + padding) for i in range(rows * cols)])

        coordinates = np.vstack((x, y)).T
        print(coordinates)
        coordinates = np.delete(coordinates, [6, 7, 8], axis=0)
        print("Trimmed coordinates", coordinates)
        return coordinates

    def get(self, layer, type, threshold):
        threshold = float(threshold)
        data_path = os.environ["DATA_PATH"]
        models = os.listdir(data_path)

        for idx, model in enumerate(models):
            model_path = os.path.join(data_path, model)
            layer_path = os.path.join(model_path, str(layer))

            if not os.path.exists(layer_path):
                print(f"Layer {layer} does not exist for model {model}")
                continue

            matrix_size = len(self.topics)
            # cosine_matrix = np.full((matrix_size, matrix_size), -1, dtype=float)

            for file_name in os.listdir(layer_path):
                if not file_name.endswith(".pkl"):
                    continue

                with open(os.path.join(layer_path, file_name), "rb") as f:
                    data = pickle.load(f)
                    try:
                        data = data[type]
                    except KeyError:
                        return {"error": "Invalid type parameter"}
                    coordinates = data["coordinates"]

                file_name = file_name.split('.')[0]
                concept1, concept2 = self.extract_concepts(file_name)
                anchor1, anchor2 = self.extract_anchors(file_name)

                if model not in self.cosine_map:
                    self.cosine_map[model] = {}
                
                for entry in coordinates:
                    if entry["conceptGroup"] not in self.cosine_map[model]:
                        self.cosine_map[model][entry["conceptGroup"]] = {}
                    if entry["concept"] not in self.cosine_map[model][entry["conceptGroup"]]:
                        self.cosine_map[model][entry["conceptGroup"]][entry["concept"]] = {}

                    self.cosine_map[model][entry["conceptGroup"]][entry["concept"]][anchor1] = entry["simToAnchor1"]
                    self.cosine_map[model][entry["conceptGroup"]][entry["concept"]][anchor2] = entry["simToAnchor2"]

        weat_data = self.weat()
        filtered_weat_data = self.filter_weat(threshold, weat_data)
        models = list(filtered_weat_data.keys())

        model_distance_matrix = self.get_model_distance_matrix(filtered_weat_data)

        print("SIZE:",model_distance_matrix.size)
        if model_distance_matrix.size == 0:
            umap_result = self.default_coords()
        else:
            umap_result = self.UMAP(model_distance_matrix)
        umap_coordinate_dict = {model: umap_result[idx].tolist() for idx, model in enumerate(models)}
           
        api_response = {
            "filtered_weat_data": filtered_weat_data,
            "umap_result": umap_coordinate_dict
        }
        return api_response