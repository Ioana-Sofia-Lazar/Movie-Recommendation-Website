import pickle
import random

from surprise import KNNBaseline
from surprise import Dataset
from surprise import Reader
from surprise import dump

from utils import rid_to_imdbid, imdbid_to_rid


_, algo = dump.load('./knn.algo')
print('Loaded knn algorithm')

recommendations = {}
with open('recommendations.pickle', 'rb') as file:
    recommendations = pickle.load(file)
print('Loaded recommendations')

user_ratings = {}
with open('user_ratings.pickle', 'rb') as file:
    user_ratings = pickle.load(file)                                                                                                                                                                                                                                                                                                                                                        
print('Loaded user ratings')


def get_similar_movies(imdb_id, num):
    if imdb_id in imdbid_to_rid.keys():
        raw_id = algo.trainset.to_inner_iid(imdbid_to_rid[imdb_id])
        neighbors = algo.get_neighbors(raw_id, k=num)
        neighbors = (algo.trainset.to_raw_iid(inner_id)
                     for inner_id in neighbors)
        neighbors = (rid_to_imdbid[rid]
                     for rid in neighbors)
    else:
        neighbors = []

    return neighbors

def get_recommendations(ratings):    
    ratings = [(imdbid_to_rid[rating[0]], rating[1]) for rating in ratings]
    uid = get_similar_uid(ratings)

    return recommendations[uid]

def get_similar_uid(ratings):
    max_score = 0
    max_uid = 0

    for uid in user_ratings.keys():
        score = compute_score(ratings, user_ratings[uid])
        if score > max_score:
            max_score = score
            max_uid = uid

    if max_uid == 0:
        max_uid = random.choice(list(user_ratings.keys()))

    return max_uid

def compute_score(ratings1, ratings2):
    score = 0
    for r1 in ratings1:
        for r2 in ratings2:
            if r1[0] != r2[0]:
                continue
            dif = abs(r1[1] - r2[1])
            if dif <= 2:
                score += 3 - dif

    return score