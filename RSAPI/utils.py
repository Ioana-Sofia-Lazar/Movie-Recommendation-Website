import io


rid_to_imdbid = {}
imdbid_to_rid = {}

with io.open('./datasets/movies_w_imdbids.csv', 'r') as f:
    for line in f:
        line = line.split(';')
        rid_to_imdbid[line[0]] = line[3]
        imdbid_to_rid[line[3]] = line[0]

