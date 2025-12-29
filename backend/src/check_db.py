from dotenv import load_dotenv
import mysql.connector
import os

load_dotenv()

def get_connection():
    return mysql.connector.connect(
        host=os.getenv('DB_HOST'),
        user='root',
        password=os.getenv('MYSQL_PASSWORD')
    )


def get_participants_amount():
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute('USE survey_db')
            cur.execute('SELECT COUNT(*) FROM Participants')
            return cur.fetchone()[0]


def get_participants_by_group():
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute('USE survey_db')
            cur.execute('SELECT COUNT(*) FROM Participants WHERE TreatmentGroup = "human"')
            human = cur.fetchone()[0]
            cur.execute('SELECT COUNT(*) FROM Participants WHERE TreatmentGroup = "machine"')
            machine = cur.fetchone()[0]
            cur.execute('SELECT COUNT(*) FROM Participants WHERE TreatmentGroup = "placebo"')
            placebo = cur.fetchone()[0]
            return (human, machine, placebo)


def get_participants_by_status():
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute('USE survey_db')
            cur.execute('SELECT COUNT(*) FROM Participants WHERE ParticipantStatus = "started"')
            started = cur.fetchone()[0]
            cur.execute('SELECT COUNT(*) FROM Participants WHERE ParticipantStatus = "tweet_1"')
            tweet_1 = cur.fetchone()[0]
            cur.execute('SELECT COUNT(*) FROM Participants WHERE ParticipantStatus = "tweet_2"')
            tweet_2 = cur.fetchone()[0]
            cur.execute('SELECT COUNT(*) FROM Participants WHERE ParticipantStatus = "tweet_3"')
            tweet_3 = cur.fetchone()[0]
            cur.execute('SELECT COUNT(*) FROM Participants WHERE ParticipantStatus = "tweet_4"')
            tweet_4 = cur.fetchone()[0]
            cur.execute('SELECT COUNT(*) FROM Participants WHERE ParticipantStatus = "answered"')
            answered = cur.fetchone()[0]
            cur.execute('SELECT COUNT(*) FROM Participants WHERE ParticipantStatus = "finished"')
            finished = cur.fetchone()[0]
            return (started, tweet_1, tweet_2, tweet_3, tweet_4, answered, finished)


def get_answers_amount():
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute('USE survey_db')
            cur.execute('SELECT COUNT(*) FROM Answers')
            return cur.fetchone()[0]


def get_answers_by_group():
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute('USE survey_db')
            cur.execute('SELECT COUNT(*) FROM Answers WHERE Text1 LIKE "%H%" OR Text2 LIKE "%H%"')
            human = cur.fetchone()[0]
            cur.execute('SELECT COUNT(*) FROM Answers WHERE Text1 LIKE "%M%" OR Text2 LIKE "%M%"')
            machine = cur.fetchone()[0]
            cur.execute('SELECT COUNT(*) FROM Answers WHERE Text1 LIKE "%P%" OR Text2 LIKE "%P%"')
            placebo = cur.fetchone()[0]
            return (human, machine, placebo)


def get_answers_by_bias():
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute('USE survey_db')
            cur.execute('SELECT COUNT(*) FROM Answers WHERE Text1 LIKE "%L%" OR Text2 LIKE "%L%"')
            left = cur.fetchone()[0]
            cur.execute('SELECT COUNT(*) FROM Answers WHERE Text1 LIKE "%R%" OR Text2 LIKE "%R%"')
            right = cur.fetchone()[0]
            return (left, right)


def get_taken_tweets_amount():
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute('USE survey_db')
            cur.execute('SELECT COUNT(*) FROM Tweets where Available = 0')
            return cur.fetchone()[0]


def get_taken_tweets_by_group():
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute('USE survey_db')
            cur.execute('SELECT COUNT(*) FROM Tweets WHERE TreatmentGroup = "human" AND Available = 0')
            human = cur.fetchone()[0]
            cur.execute('SELECT COUNT(*) FROM Tweets WHERE TreatmentGroup = "machine" AND Available = 0')
            machine = cur.fetchone()[0]
            cur.execute('SELECT COUNT(*) FROM Tweets WHERE TreatmentGroup = "placebo" AND Available = 0')
            placebo = cur.fetchone()[0]
            return (human, machine, placebo)


def get_taken_tweets_by_bias():
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute('USE survey_db')
            cur.execute('SELECT COUNT(*) FROM Tweets WHERE PoliticalBias = -1 AND Available = 0')
            left = cur.fetchone()[0]
            cur.execute('SELECT COUNT(*) FROM Tweets WHERE PoliticalBias = 1 AND Available = 0')
            right = cur.fetchone()[0]
            return (left, right)


def get_available_tweets_amount():
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute('USE survey_db')
            cur.execute('SELECT COUNT(*) FROM Tweets where Available = 1')
            return cur.fetchone()[0]


def get_available_tweets_by_group():
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute('USE survey_db')
            cur.execute('SELECT COUNT(*) FROM Tweets WHERE TreatmentGroup = "human" AND Available = 1')
            human = cur.fetchone()[0]
            cur.execute('SELECT COUNT(*) FROM Tweets WHERE TreatmentGroup = "machine" AND Available = 1')
            machine = cur.fetchone()[0]
            cur.execute('SELECT COUNT(*) FROM Tweets WHERE TreatmentGroup = "placebo" AND Available = 1')
            placebo = cur.fetchone()[0]
            return (human, machine, placebo)


def get_available_tweets_by_bias():
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute('USE survey_db')
            cur.execute('SELECT COUNT(*) FROM Tweets WHERE PoliticalBias = -1 AND Available = 1')
            left = cur.fetchone()[0]
            cur.execute('SELECT COUNT(*) FROM Tweets WHERE PoliticalBias = 1 AND Available = 1')
            right = cur.fetchone()[0]
            return (left, right)


def check_db():
    participants_amount = get_participants_amount()
    participants_by_group = get_participants_by_group()
    participants_by_status = get_participants_by_status()
    answers_amount = get_answers_amount()
    answers_by_group = get_answers_by_group()
    answers_by_bias = get_answers_by_bias()
    taken_tweets_amount = get_taken_tweets_amount()
    taken_tweets_by_group = get_taken_tweets_by_group()
    taken_tweets_by_bias = get_taken_tweets_by_bias()
    available_tweets_amount = get_available_tweets_amount()
    available_tweets_by_group = get_available_tweets_by_group()
    available_tweets_by_bias = get_available_tweets_by_bias()
    print((
        '|-=-=- Database stats -=-=-\n'
        '|\n'
        '|  Participants amount: {}\n'
        '|  - By group:\n'
        '|  -- Human: {}\n'
        '|  -- Machine: {}\n'
        '|  -- Placebo: {}\n'
        '|  - By status:\n'
        '|  -- Started: {}\n'
        '|  -- Tweet 1: {}\n'
        '|  -- Tweet 2: {}\n'
        '|  -- Tweet 3: {}\n'
        '|  -- Tweet 4: {}\n'
        '|  -- Answered: {}\n'
        '|  -- Finished: {}\n'
        '|\n'
        '|  Answers amount: {}\n'
        '|  - By group:\n'
        '|  -- Human: {}\n'
        '|  -- Machine: {}\n'
        '|  -- Placebo {}\n'
        '|  - By tweet bias:\n'
        '|  -- Left biased: {}\n'
        '|  -- Right biased {}\n'
        '|\n'
        '|  Taken tweets amount: {}\n'
        '|  - By group:\n'
        '|  -- Human: {}\n'
        '|  -- Machine: {}\n'
        '|  -- Placebo {}\n'
        '|  - By tweet bias:\n'
        '|  -- Left biased: {}\n'
        '|  -- Right biased {}\n'
        '|\n'
        '|  Available tweets amount: {}\n'
        '|  - By group:\n'
        '|  -- Human: {}\n'
        '|  -- Machine: {}\n'
        '|  -- Placebo {}\n'
        '|  - By tweet bias:\n'
        '|  -- Left biased: {}\n'
        '|  -- Right biased {}\n'
        '|-=-=-=-=-=-=-=-=-=-=-=-=-'
    ).format(
        participants_amount,
        participants_by_group[0],
        participants_by_group[1],
        participants_by_group[2],
        participants_by_status[0],
        participants_by_status[1],
        participants_by_status[2],
        participants_by_status[3],
        participants_by_status[4],
        participants_by_status[5],
        participants_by_status[6],
        answers_amount,
        answers_by_group[0],
        answers_by_group[1],
        answers_by_group[2],
        answers_by_bias[0],
        answers_by_bias[1],
        taken_tweets_amount,
        taken_tweets_by_group[0],
        taken_tweets_by_group[1],
        taken_tweets_by_group[2],
        taken_tweets_by_bias[0],
        taken_tweets_by_bias[1],
        available_tweets_amount,
        available_tweets_by_group[0],
        available_tweets_by_group[1],
        available_tweets_by_group[2],
        available_tweets_by_bias[0],
        available_tweets_by_bias[1]
        ))


if __name__ == '__main__':
    check_db()
