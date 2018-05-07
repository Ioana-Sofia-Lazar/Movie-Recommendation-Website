from flask import Flask, jsonify, request
from functools import wraps
import json

from recommender import get_similar_movies

TOKEN = '5UP3R53CR37'

def requires_token(f):
	def wrap(*args, **kwargs):
		if 'Token' in request.headers.keys() and request.headers['Token'] == TOKEN:
			return f(*args, **kwargs)
		return jsonify({ 'error': 'You must provide a valid token!' })
	return wrap

def pad(id):
	id = str(id)
	while len(id) < 7:
		id = '0' + id
	return id

app = Flask(__name__)

@app.route('/similarToMovie')
@requires_token
def get():
	imdb_id = request.args.get('id').lstrip('t').lstrip('0')
	num = request.args.get('num', default=10)
	movies = get_similar_movies(imdb_id, num)

	data = [{ 'id': 'tt' + pad(movie) } for movie in movies]
	return json.dumps(data)

if __name__ == '__main__':
	app.run(host='0.0.0.0', port=5002)


