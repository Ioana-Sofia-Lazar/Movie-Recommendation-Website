import io

from surprise import KNNBaseline
from surprise import Dataset
from surprise import get_dataset_dir


def read_item_names():
    file_name = get_dataset_dir() + '/ml-100k/ml-100k/u.item'
    rid_to_name = {}
    name_to_rid = {}
    with io.open(file_name, 'r', encoding='ISO-8859-1') as f:
        for line in f:
            line = line.split('|')
            rid_to_name[line[0]] = line[3]
            name_to_rid[line[3]] = line[0]

    return rid_to_name, name_to_rid


data = Dataset.load_builtin('ml-100k')
trainset = data.build_full_trainset()
sim_options = {'name': 'pearson_baseline', 'user_based': False}
algo = KNNBaseline(sim_options=sim_options)
algo.fit(trainset)

rid_to_name, name_to_rid = read_item_names()

def get_similar_movies(imdb_id, num):
	if imdb_id in name_to_rid.keys():
		raw_id = algo.trainset.to_inner_iid(name_to_rid[imdb_id])
		neighbors = algo.get_neighbors(raw_id, k=num)
		neighbors = (algo.trainset.to_raw_iid(inner_id)
                	 for inner_id in neighbors)
		neighbors = (rid_to_name[rid]
                     for rid in neighbors)
	else:
		neighbors = []

	return neighbors