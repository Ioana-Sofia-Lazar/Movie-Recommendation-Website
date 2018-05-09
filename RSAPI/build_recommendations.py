import pickle
from collections import defaultdict
from surprise import SVD
from surprise import Dataset
from surprise import Reader

from utils import rid_to_imdbid


def get_top_n(predictions, n=10):
    top_n = defaultdict(list)

    for uid, iid, true_r, est, _ in predictions:
        top_n[uid].append((iid, est))

    for uid, user_ratings in top_n.items():
        user_ratings.sort(key=lambda x: x[1], reverse=True)
        top_n[uid] = user_ratings[:n]

    return top_n

if __name__ == '__main__':
	print('Building recommendations...')

	reader = Reader(line_format='user item rating timestamp', sep=',')
	data = Dataset.load_from_file('./datasets/ratings.csv', reader=reader)
	print('Loaded dataset')

	trainset = data.build_full_trainset()
	print('Built trainset')

	algo = SVD()
	algo.fit(trainset)
	print('Fitted trainset')

	testset = trainset.build_anti_testset()
	predictions = algo.test(testset)
	print('Made predictions')

	top_n = get_top_n(predictions, n=10)

	for uid in top_n.keys():
	    iid_list = top_n[uid]
	    imdbid_list = [rid_to_imdbid[iid] for (iid, _) in iid_list]
	    top_n[uid] = imdbid_list

	with open('recommendations.pickle', 'wb') as file:
	    pickle.dump(top_n, file, protocol=pickle.HIGHEST_PROTOCOL)
	print('Wrote top-n')