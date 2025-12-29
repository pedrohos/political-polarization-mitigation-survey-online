import os
import mysql.connector
import pandas as pd
from dotenv import load_dotenv
from sqlalchemy import create_engine

os.chdir(os.path.dirname(__file__))
DATA_DIR = '../data/database/'

load_dotenv()
engine = create_engine('mysql+mysqlconnector://root:{}@{}:{}/{}'.format(os.getenv('MYSQL_PASSWORD'), os.getenv('DB_HOST'), os.getenv('DB_PORT'), os.getenv('DB_NAME')))

def export_to_sql():
    print('Generating sql file...')
    os.system('mysqldump -u root -p{} {} > {}{}.sql'.format(os.getenv('MYSQL_PASSWORD'), os.getenv('DB_NAME'), DATA_DIR, os.getenv('DB_NAME')))
    print('SQL file generated.')


def export_participants():
    print('Exporting participants...')
    file_path = os.path.join(DATA_DIR, 'participants.parquet')
    query = 'SELECT * FROM Participants;'
    with engine.connect() as con:
        df = pd.read_sql(query, con)
    df.to_parquet(file_path, index=False)


def export_answers():
    print('Exporting answers...')
    file_path = os.path.join(DATA_DIR, 'answers.parquet')
    query = 'SELECT * FROM Answers;'
    with engine.connect() as con:
        df = pd.read_sql(query, con)
    df.to_parquet(file_path, index=False)


def export_tweets():
    print('Exporting tweets...')
    file_path = os.path.join(DATA_DIR, 'tweets.parquet')
    query = 'SELECT * FROM Tweets;'
    with engine.connect() as con:
        df = pd.read_sql(query, con)
    df.to_parquet(file_path, index=False)


def export_rephrases():
    print('Exporting rephrased tweets...')
    file_path = os.path.join(DATA_DIR, 'rephrases.parquet')
    query = 'SELECT * FROM RephrasedTweets;'
    with engine.connect() as con:
        df = pd.read_sql(query, con)
    df.to_parquet(file_path, index=False)


def export_sessions():
    print('Exporting sessions...')
    file_path = os.path.join(DATA_DIR, 'sessions.parquet')
    query = 'SELECT * FROM Sessions;'
    with engine.connect() as con:
        df = pd.read_sql(query, con)
    df.to_parquet(file_path, index=False)


def export_db():
    export_to_sql()
    export_participants()
    export_answers()
    export_tweets()
    export_rephrases()
    export_sessions()

def main():
    export_db()


if __name__ == '__main__':
    main()
