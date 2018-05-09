import io
import pickle

from utils import rid_to_imdbid


user_ratings = {}
with io.open('./datasets/ratings.csv', 'r') as f:
    for line in f:
	    line = line.split(',')
	    
	    uid = line[0]
	    iid = line[1]
	    rating = line[2]

	    if uid not in user_ratings.keys():
	    	user_ratings[uid] = []

	    user_ratings[uid].append((rid_to_imdbid[iid], rating))

with open('user_ratings.pickle', 'wb') as file:
    pickle.dump(user_ratings, file, protocol=pickle.HIGHEST_PROTOCOL)

print('Built user ratings')