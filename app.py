from flask import Flask, render_template, jsonify, request
import json
import os
import random

app = Flask(__name__)

# Cache for questions
questions_cache = None
QUESTIONS_FILE = os.path.join(os.path.dirname(__file__), 'questions.json')

def get_questions():
    global questions_cache
    if questions_cache is None:
        try:
            with open(QUESTIONS_FILE, 'r', encoding='utf-8') as f:
                questions_cache = json.load(f)
        except Exception as e:
            return None, str(e)
    return questions_cache, None

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/questions')
def api_questions():
    topic = request.args.get('topic')
    questions, error = get_questions()
    if error:
        return jsonify({'error': f'Failed to load questions: {error}'}), 500
    if topic and topic in questions:
        questions_list = questions[topic][:]
        random.shuffle(questions_list)
        return jsonify(questions_list)
    return jsonify([])

if __name__ == '__main__':
    app.run(debug=True) 