from surprise import KNNBaseline
from surprise import Dataset
from surprise import Reader
from surprise import dump


if __name__ == '__main__':
	reader = Reader(line_format='user item rating timestamp', sep=',')
	data = Dataset.load_from_file('./datasets/ratings.csv', reader=reader)
	trainset = data.build_full_trainset()
	sim_options = { 'name': 'pearson_baselineclear', 'user_based': False }
	algo = KNNBaseline(sim_options=sim_options)
	algo.fit(trainset)

	dump.dump('./knn.algo', algo=algo)