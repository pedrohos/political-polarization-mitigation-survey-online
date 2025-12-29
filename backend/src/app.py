import os
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
# from pandas.tests.window.conftest import parallel
from src.lib.db_utils import DBUtils
from datetime import datetime
from src.lib.utils import create_hash, verify_hash

from dotenv import load_dotenv
load_dotenv()

assert os.environ.get('DATA_PATH') is not None, "DATA_PATH environment variable must be set"
assert os.environ.get('FRONTEND_HOST') is not None, "FRONTEND_HOST environment variable must be set"
assert os.environ.get('FRONTEND_PORT') is not None, "FRONTEND_PORT environment variable must be set"
assert os.environ.get('BACKEND_PORT') is not None, "BACKEND_PORT environment variable must be set"
DATA_PATH = os.environ['DATA_PATH']
FRONTEND_HOST = os.environ['FRONTEND_HOST']
FRONTEND_PORT = os.environ['FRONTEND_PORT']
BACKEND_PORT = os.environ['BACKEND_PORT']

os.chdir(os.path.dirname(__file__))
app = Flask(__name__)

# Enable CORS for the frontend origin (Next.js dev server on port 'FRONTEND_PORT')
CORS(app, resources={
    r"/api/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

db_utils = DBUtils()

def _get_cur_time():
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

def save_2_log(message):
    with open(os.path.join(DATA_PATH + 'log.txt'), 'a') as f:
        f.write(f'{_get_cur_time()} -- {message}\n')


@app.route('/api')
def index():
    return jsonify({'message': 'Hello World!'})

# Participant
@app.route('/api/participant/retrieve_status', methods=['POST'])
def get_participant_status():
    data: dict = request.json
    pId = data["pId"]
    # Hash the incoming raw participant identifier (password / prolific id) to match storage format
    participant_hash = create_hash(pId)
    status = db_utils.get_participant_status(participant_hash)
    save_2_log(f'Getting participant {participant_hash} (raw: {pId}) -> {status}')
    if status is None:
        # Explicit 404 so frontend can treat as new participant
        return jsonify({"status": None, "message": "Participant not found"}), 404
    return jsonify({"status": status})

@app.route('/api/participant/set_status', methods=['POST', 'PUT'])
def set_participant_status():
    data: dict = request.json
    status = data['status']
    pId = data["pId"]

    # Hash the incoming raw participant identifier (password / prolific id) to match storage format
    participant_hash = create_hash(pId)
    
    db_utils.update_participant_status(participant_hash, status)
    save_2_log(f'Participant {pId} status set to {status}')
    return jsonify({'message': f'Participant {pId} status set to {status}'})

@app.route('/api/participant/create_participant', methods=['POST'])
def create_participant():
    data: dict = request.json or {}
    participant_id = data.get('pId')
    is_prolific = data.get('isProlific')
    current_time = data.get('curTime')
    political_leaning = data.get('politicalLean')
    interestsMatrix = data.get('interestsMatrix', [])

    assert is_prolific in [True, False], "isProlific must be a boolean"

    if not participant_id:
        return jsonify({'message': 'pId is required'}), 400
    if political_leaning is None:
        return jsonify({'message': 'politicalLean is required'}), 400

    participant_hash = create_hash(participant_id)
    save_2_log(f'Trying to create participant {participant_hash}')
    res = db_utils.get_participant_status(participant_hash)

    # There is a participant present
    if res is not None:
        # Finished the survey
        if res == "completed":
            save_2_log(f'Participant {participant_hash} already completed the survey, not creating new session')
            return jsonify({'message': f'Participant {participant_hash} already completed the survey', "completed": True}), 400
        else:
            session_is_valid, session_data = _validate_session(participant_hash)
            if session_is_valid:
                save_2_log(f'Participant {participant_hash} already exists with valid session, not creating new session')
                return jsonify({'message': f'Participant {participant_hash} already exists with valid session'}), 200
            else:
                save_2_log(f'Participant {participant_hash} already exists with invalid session, recreating session')
                db_utils.create_session(participant_hash, current_time, is_prolific)
                return jsonify({'message': f'Participant {participant_hash} already exists with invalid session, session was recreated'})

    db_utils.create_participant(participant_hash, political_leaning)
    db_utils.create_participant_interests(participant_hash, interestsMatrix)
    db_utils.create_session(participant_hash, current_time, is_prolific)
    return jsonify({'message': f'Participant {participant_hash} and session created'})

def _validate_session(participant_hash):
    validity_res = db_utils.check_session_is_valid(participant_hash)
    data = None
    valid = True
    if not validity_res["is_valid"]:
        if validity_res["session_exists"]:
            save_2_log(f'Session for participant {participant_hash} was found as invalid, deleting session and participant interests')
            db_utils.invalidate_session_no_deletion_interests(participant_hash)
        else:
            save_2_log(f'Session for participant {participant_hash} is not valid and does not exist, just updating participant status')
            db_utils.invalidate_session_no_deletion(participant_hash)

        data = jsonify({'message': f'Session for participant {participant_hash} is not valid', "validity_res": validity_res}), 400
        valid = False
    return valid, data

@app.route('/api/participant/update_last_update_time', methods=['POST'])
def update_participant_last_update_time():
    data: dict = request.json or {}
    participant_id = data.get('pId')
    
    if not participant_id:
        return jsonify({'message': 'pId is required'}), 400
    
    participant_hash = create_hash(participant_id)
    
    session_is_valid, session_data = _validate_session(participant_hash)
    if not session_is_valid:
        return session_data
    
    db_utils.update_session_last_update_time(participant_hash, _get_cur_time())
    save_2_log(f'Updating last update time for participant {participant_hash}')
    return jsonify({'message': f'Last update time for participant {participant_hash} updated'})

@app.route('/api/answer/create_answer', methods=['POST'])
def create_answer():
    data: dict = request.json or {}
    participant_id = data.get('pId')
    page_number = data.get('pageNumber')
    
    if not participant_id:
        return jsonify({'message': 'pId is required'}), 400
    if page_number is None:
        return jsonify({'message': 'pageNumber is required'}), 400
    
    participant_hash = create_hash(participant_id)
    
    session_is_valid, session_data = _validate_session(participant_hash)
    if not session_is_valid:
        return session_data
    
    session_res = db_utils.get_session(participant_hash)
    if session_res:
        session_id = session_res['session_id']
        db_utils.create_answer(session_id, page_number)
        # Update the last update time of the session
        db_utils.update_session_last_update_time(participant_hash, _get_cur_time())
        save_2_log(f'Creating answer for participant {participant_hash} on page {page_number}')
        return jsonify({'status': "answer_created"})
    else:
        return jsonify({'message': f'Participant {participant_hash} does not have a valid session'}), 400

@app.route('/api/answer/update_answer', methods=['POST'])
def update_answer():
    data: dict = request.json or {}
    participant_id = data.get('pId')
    page_number = data.get('pageNumber')
    answers = data.get('answers', {})
    in_initial_question = data.get('inFirstSection', True)

    if not participant_id:
        return jsonify({'message': 'pId is required'}), 400
    if page_number is None:
        return jsonify({'message': 'pageNumber is required'}), 400
    if not answers:
        return jsonify({'message': 'answers are required'}), 400

    participant_hash = create_hash(participant_id)
    session_is_valid, session_data = _validate_session(participant_hash)
    if not session_is_valid:
        return session_data

    db_utils.update_answer(participant_hash, page_number, answers, in_initial_question)
    save_2_log(f'Updating answer for participant {participant_hash} on page {page_number} with answers {answers}')
    return jsonify({'message': f'Answer for participant {participant_hash} on page {page_number} updated'})

@app.route('/api/answer/retrieve_answer', methods=['POST'])
def get_answer():
    data: dict = request.json or {}
    participant_id = data.get('pId')
    page_number = data.get('pageNumber')
    
    participant_hash = create_hash(participant_id)
    answer = db_utils.get_answer(participant_hash, page_number)
    return jsonify(answer)

@app.route('/api/verification/retrieve_data', methods=['POST'])
def get_verification_data():
    data: dict = request.json or {}
    participant_id = data.get('pId')
    page_number = data.get('pageNumber')
    
    participant_hash = create_hash(participant_id)
    return jsonify(db_utils.get_verification_data(participant_hash, page_number))

@app.route('/api/participant/retrieve_answer_time', methods=['POST'])
def get_participant_answer_time():
    data: dict = request.json or {}
    participant_id = data.get('pId')
    
    participant_hash = create_hash(participant_id)
    return jsonify(db_utils.get_participant_answer_time(participant_hash))

# Session
# @app.route('/api/session/', methods=['POST'])
# def create_session():
#     data: dict = request.json
#     participant_id = data['pId']
#     save_2_log(f'Getting session {id}')
#     start_time = _get_cur_time()
#     db_utils.create_session(participant_id, start_time)


if __name__ == '__main__':
    app.run(debug=False, port=int(BACKEND_PORT))
