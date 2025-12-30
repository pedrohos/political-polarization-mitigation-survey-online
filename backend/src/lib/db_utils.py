import os
import src.lib.utils as utils
from dotenv import load_dotenv
import mysql.connector
from src.lib.models import Singleton, TreatmentType, ParticipantStatus, NEWS_CATEGORIES_TYPES
import re
from collections import OrderedDict
import random
import datetime

load_dotenv()

class DBUtils(Singleton):
    def __init__(self):
        self.db_name = os.getenv('DB_NAME')
        self.__initialize_database()
    
    def __get_connection(self):
        return mysql.connector.connect(
            host = os.getenv('DB_HOST'),
            port=os.getenv('DB_PORT'),
            user= 'root',
            password = os.getenv('MYSQL_PASSWORD')
        )

    def __create_tables(self):
        TABLE_SQLS = OrderedDict([
            ('categories', '''CREATE TABLE IF NOT EXISTS NewsCategory (
                NewsCategoryId INT NOT NULL AUTO_INCREMENT,
                NewsCategoryName VARCHAR(50) NOT NULL UNIQUE,
                PRIMARY KEY (NewsCategoryId)
            );'''),
            ('participants', '''CREATE TABLE IF NOT EXISTS Participants (
                ParticipantId VARCHAR(255) NOT NULL,
                ParticipantStatus VARCHAR(255) NOT NULL,
                PoliticalLeaning TINYINT,
                PRIMARY KEY (ParticipantId)
            );'''),
            ('participant_interests', '''CREATE TABLE IF NOT EXISTS ParticipantInterests (
                FK_ParticipantId VARCHAR(255) NOT NULL,
                FK_NewsCategoryId INT NOT NULL,
                LevelOfInterest TINYINT NOT NULL,
                PRIMARY KEY (FK_ParticipantId, FK_NewsCategoryId),
                FOREIGN KEY (FK_NewsCategoryId) REFERENCES NewsCategory(NewsCategoryId),
                FOREIGN KEY (FK_ParticipantId) REFERENCES Participants(ParticipantId)
            );'''),
            ('news', '''CREATE TABLE IF NOT EXISTS News (
                NewsId CHAR(8) NOT NULL,
                NewsText VARCHAR(7000) NOT NULL,
                FK_NewsCategoryId INT NOT NULL,
                PRIMARY KEY (NewsId),
                FOREIGN KEY (FK_NewsCategoryId) REFERENCES NewsCategory(NewsCategoryId)
            );'''),
            ('verifications', '''CREATE TABLE IF NOT EXISTS Verifications (
                VerificationId CHAR(20) NOT NULL,
                VerificationText TEXT(50000) NOT NULL,
                TreatmentType VARCHAR(7) NOT NULL,
                Verdict VARCHAR(20) NOT NULL,
                FK_NewsId CHAR(8) NOT NULL,
                Num_Uses INT NOT NULL,
                PRIMARY KEY (VerificationId),
                FOREIGN KEY (FK_NewsId) REFERENCES News(NewsId)
            );'''),
            ('sessions', '''CREATE TABLE IF NOT EXISTS Sessions (
                FK_ParticipantId VARCHAR(255) NOT NULL,
                FK_VerificationId1 CHAR(20) NOT NULL,
                FK_VerificationId2 CHAR(20) NOT NULL,
                FK_VerificationId3 CHAR(20) NOT NULL,
                FK_VerificationId4 CHAR(20) NOT NULL,
                IsProlific TINYINT(1) NOT NULL,
                StartTime DATETIME NOT NULL,
                LastUpdateTime DATETIME NOT NULL,
                PRIMARY KEY (FK_ParticipantId),
                FOREIGN KEY (FK_ParticipantId) REFERENCES Participants(ParticipantId),
                FOREIGN KEY (FK_VerificationId1) REFERENCES Verifications(VerificationId),
                FOREIGN KEY (FK_VerificationId2) REFERENCES Verifications(VerificationId),
                FOREIGN KEY (FK_VerificationId3) REFERENCES Verifications(VerificationId),
                FOREIGN KEY (FK_VerificationId4) REFERENCES Verifications(VerificationId),
                CONSTRAINT chk_unique_verifications
                CHECK (FK_VerificationId1 <> FK_VerificationId2 AND
                       FK_VerificationId1 <> FK_VerificationId3 AND
                       FK_VerificationId1 <> FK_VerificationId4 AND
                       FK_VerificationId2 <> FK_VerificationId3 AND
                       FK_VerificationId2 <> FK_VerificationId4 AND
                       FK_VerificationId3 <> FK_VerificationId4)
            );'''),
            ('answers', '''CREATE TABLE IF NOT EXISTS Answers (
                FK_SessionId VARCHAR(255) NOT NULL,
                FK_VerificationId CHAR(20) NOT NULL,
                SEEN_ALEGATIONS TINYINT DEFAULT NULL,
                CONFIDENCE_BEFORE_ALEGATIONS TINYINT DEFAULT NULL,
                CONFIDENCE_AFTER_ALEGATIONS TINYINT DEFAULT NULL,
                ANALYSIS_DEEP_ENOUGH TINYINT DEFAULT NULL,
                MATRIX_PERSUASIVENESS TINYINT DEFAULT NULL,
                MATRIX_COHERENCE TINYINT DEFAULT NULL,
                MATRIX_COMMON_SENSE TINYINT DEFAULT NULL,
                MATRIX_RANK_SQ TINYINT DEFAULT NULL,
                MATRIX_RANK_PC TINYINT DEFAULT NULL,
                MATRIX_RANK_TC TINYINT DEFAULT NULL,
                MATRIX_RANK_CS TINYINT DEFAULT NULL,
                MATRIX_RANK_NE TINYINT DEFAULT NULL,
                PRIMARY KEY (FK_SessionId, FK_VerificationId),
                FOREIGN KEY (FK_SessionId) REFERENCES Sessions(FK_ParticipantId) ON DELETE CASCADE,
                FOREIGN KEY (FK_VerificationId) REFERENCES Verifications(VerificationId)
            );''')
        ])

        with self.__get_connection() as con:
            cur = con.cursor()
            cur.execute(f"USE {self.db_name}")

            for table in TABLE_SQLS.values():
                cur.execute(table)
            con.commit()

    def __initialize_categories(self):
        with self.__get_connection() as con:
            cur = con.cursor()
            cur.execute(f"USE {self.db_name}")
            for category in NEWS_CATEGORIES_TYPES:
                cur.execute("INSERT IGNORE INTO NewsCategory (NewsCategoryName) VALUES (%s)", (category,))
            con.commit()

    def __initialize_database(self):
        with self.__get_connection() as con:
            cur = con.cursor()
            cur.execute(f"CREATE DATABASE IF NOT EXISTS {self.db_name}")
            self.__create_tables()
            self.__initialize_categories()

   
    # News Category
    def create_news_category(self, category_name):
        sql = ('INSERT INTO NewsCategory (NewsCategoryName)'
            'VALUES (%s)')
        args = (category_name,)
        with self.__get_connection() as con:
            cur = con.cursor()
            cur.execute(f"USE {self.db_name}")
            cur.execute(sql, args)
            con.commit()
    
    def get_news_category_id(self, category_name):
        sql = ('SELECT NewsCategoryId FROM NewsCategory WHERE NewsCategoryName=%s')
        args = (category_name,)
        with self.__get_connection() as con:
            cur = con.cursor()
            cur.execute(f"USE {self.db_name}")
            cur.execute(sql, args)
            res = cur.fetchone()[0]
            return res

    # News
    def create_news(self, news_id, news_text, news_category_name):
        news_category_id = self.get_news_category_id(news_category_name)
        with self.__get_connection() as con:
            cur = con.cursor()
            cur.execute(f"USE {self.db_name}")
            cur.execute("INSERT INTO News (NewsId, NewsText, FK_NewsCategoryId) VALUES (%s, %s, %s)", (news_id, news_text, news_category_id,))
            con.commit()

    # Verification
    def create_verification(self, verification_id, verification_text, verdict, group, news_category_id):
        sql = ('INSERT INTO Verifications (VerificationId, VerificationText, Verdict, TreatmentType, FK_NewsId, Num_Uses)'
            'VALUES (%s, %s, %s, %s, %s, 0)')
        args = (verification_id, verification_text, verdict, group, news_category_id)
        with self.__get_connection() as con:
            cur = con.cursor()
            cur.execute(f"USE {self.db_name}")
            cur.execute(sql, args)
            con.commit()

    # Session
    def create_session(self, participant_id, start_time, is_prolific: bool, seed: int = 42):
        try:
            # FK_NewsCategoryId, LevelOfInterest From ParticipantInterests
            category_id_and_interest_level_pairs = self.get_participant_interests(participant_id)

            # VerificationId, Num_Uses, FK_NewsCategoryId, TreatmentType From Verifications
            verification_n_uses_and_category_id_pairs = self.get_verifications_n_uses_and_category()

            human_group_data = []
            machine_group_data = []
            for (verification_id, n_uses, news_category_id, treatment_type) in verification_n_uses_and_category_id_pairs:
                if treatment_type == TreatmentType.HUMAN.value:
                    human_group_data.append((verification_id, n_uses, news_category_id, category_id_and_interest_level_pairs[news_category_id]))
                elif treatment_type == TreatmentType.MACHINE.value:
                    machine_group_data.append((verification_id, n_uses, news_category_id, category_id_and_interest_level_pairs[news_category_id]))
                else:
                    raise Exception(f"Unknown treatment type: {treatment_type}")

            def get_sample(collection: list[tuple[str, int, str, str]], amount_to_retrieve: int) -> list[tuple[str, int, str, str]]:
                assert amount_to_retrieve > 0
                assert len(collection) >= amount_to_retrieve

                # Get all elements with n_uses == 1
                one_element_group = []
                all_other_elements = []
                for item in collection:
                    n_uses = item[1]
                    if n_uses == 1:
                        one_element_group.append(item)
                    else:
                        all_other_elements.append(item)    

                # Sort by interest level (asc), verification_id (asc)
                one_element_group.sort(key=lambda item: (item[3], item[0]))  # Sort by verification_id

                # Sort by interest level (asc), verification_id (asc)
                all_other_elements.sort(key=lambda item: (item[3], item[0]))  # Sort by verification_id
                
                results = []
                missing_data = amount_to_retrieve
                if len(one_element_group) > 0:
                    results.extend(random.sample(one_element_group, min(amount_to_retrieve, len(one_element_group))))
                    missing_data -= len(results)
                
                if missing_data > 0:
                    # Remove already selected elements in the step before to avoid repetition
                    for single_res in results:
                        if single_res in all_other_elements:
                            all_other_elements.remove(single_res)
                    results.extend(random.sample(all_other_elements, missing_data))
                return results
            

            # The sorting is to ensure that the random selection is deterministic given the same seed
            # No matter the order of the insertion in the database
            human_group_data.sort(key= lambda item: (item[0], item[2]))
            machine_group_data.sort(key= lambda item: (item[0], item[2]))

            # Two samples are selected and shuffled in a controlled random manner from each group
            random.seed(seed)
            human_sample = get_sample(human_group_data, 2)
            machine_sample = get_sample(machine_group_data, 2)
            random_data = human_sample + machine_sample
            random.shuffle(random_data)

            verification_id1, verification_id2, verification_id3, verification_id4 = [item[0] for item in random_data]
            is_prolific_int = 1 if is_prolific else 0

            sql = ('INSERT INTO Sessions (FK_ParticipantId, IsProlific, StartTime, LastUpdateTime, FK_VerificationId1, FK_VerificationId2, FK_VerificationId3, FK_VerificationId4)'
                'VALUES (%s, %s, %s, %s, %s, %s, %s, %s)')
            # Last update time is initially the same as start time
            args = (participant_id, is_prolific_int, start_time, start_time, verification_id1, verification_id2, verification_id3, verification_id4)
            with self.__get_connection() as con:
                cur = con.cursor()
                cur.execute(f"USE {self.db_name}")
                cur.execute(sql, args)
                con.commit()

            self.increase_verification_num_uses(verification_id1, 1)
            self.increase_verification_num_uses(verification_id2, 1)
            self.increase_verification_num_uses(verification_id3, 1)
            self.increase_verification_num_uses(verification_id4, 1)
        except Exception as e1:
            # try:
            self.delete_participant_interests(participant_id)
            self.update_participant_status(participant_id, 'new')
            raise e1
            # except Exception as e2:
            #     raise e1


    def get_session(self, participant_id):
        sql = ('SELECT FK_ParticipantId, FK_VerificationId1, FK_VerificationId2, FK_VerificationId3, FK_VerificationId4, StartTime, LastUpdateTime, IsProlific FROM Sessions WHERE FK_ParticipantId=%s')
        args = (participant_id,)
        with self.__get_connection() as con:
            cur = con.cursor()
            cur.execute(f"USE {self.db_name}")
            cur.execute(sql, args)
            res = cur.fetchone()
            if res:
                return {
                    'session_id': res[0],
                    'verification_ids': [res[1], res[2], res[3], res[4]],
                    'start_time': res[5],
                    'last_update_time': res[6],
                    'is_prolific': bool(res[7])
                }
            else:
                return None

    def update_session_last_update_time(self, participant_id, new_time):
        sql = ('UPDATE Sessions SET LastUpdateTime=%s WHERE FK_ParticipantId=%s')
        args = (new_time, participant_id)
        with self.__get_connection() as con:
            cur = con.cursor()
            cur.execute(f"USE {self.db_name}")
            cur.execute(sql, args)
            con.commit()

    def delete_session(self, participant_id):
        session_res = self.get_session(participant_id)

        if session_res is not None:
            # Decrement the Num_Uses of the verifications associated with the session
            for verification_id in session_res['verification_ids']:
                self.increase_verification_num_uses(verification_id, -1)

            sql = ('DELETE FROM Sessions WHERE FK_ParticipantId=%s')
            args = (participant_id,)
            with self.__get_connection() as con:
                cur = con.cursor()
                cur.execute(f"USE {self.db_name}")
                cur.execute(sql, args)
                con.commit()

    # Participant
    def create_participant(self, participant_id, political_leaning, status = ParticipantStatus.NEW.value):
        sql = ('INSERT INTO Participants (ParticipantId, ParticipantStatus, PoliticalLeaning)'
            'VALUES (%s, %s, %s)')
        args = (participant_id, status, political_leaning)
        with self.__get_connection() as con:
            cur = con.cursor()
            cur.execute(f"USE {self.db_name}")
            cur.execute(sql, args)
            con.commit()
    
    def get_participant_status(self, participant_id):
        sql = ('SELECT ParticipantStatus FROM Participants WHERE ParticipantId=%s')
        args = (participant_id,)
        with self.__get_connection() as con:
            cur = con.cursor()
            cur.execute(f"USE {self.db_name}")
            cur.execute(sql, args)
            res = cur.fetchone()
            return res[0] if res else None
    
    def get_participant_interests(self, participant_id):
        sql = (
            'SELECT '
                'FK_NewsCategoryId, LevelOfInterest '
            'FROM '
                'ParticipantInterests '
            'WHERE '
                'FK_ParticipantId=%s'
            )
        args = (participant_id,)
        with self.__get_connection() as con:
            cur = con.cursor()
            cur.execute(f"USE {self.db_name}")
            cur.execute(sql, args)
            res = cur.fetchall()
            return {row[0]: row[1] for row in res} if res else {}

    def update_participant_status(self, participant_id, status):
        assert status in [status.value for status in ParticipantStatus], "Invalid status"
        sql = ('UPDATE Participants SET ParticipantStatus=%s WHERE ParticipantId=%s')
        args = (status, participant_id)
        with self.__get_connection() as con:
            cur = con.cursor()
            cur.execute(f"USE {self.db_name}")
            cur.execute(sql, args)
            con.commit()
    
    # Participant Interests
    def create_participant_interests(self, participant_id, interests_matrix: list[int]):
        sql = ('INSERT INTO ParticipantInterests (FK_ParticipantId, FK_NewsCategoryId, LevelOfInterest)'
            'VALUES (%s, %s, %s)')
        with self.__get_connection() as con:
            cur = con.cursor()
            cur.execute(f"USE {self.db_name}")
            for idx, interest_level in enumerate(interests_matrix):
                category_name = NEWS_CATEGORIES_TYPES[idx]
                category_id = self.get_news_category_id(category_name)  # Ensure category exists
                args = (participant_id, category_id, interest_level)
                cur.execute(sql, args)
            con.commit()

    def delete_participant_interests(self, participant_id):
        sql = ('DELETE FROM ParticipantInterests WHERE FK_ParticipantId=%s')
        args = (participant_id,)
        with self.__get_connection() as con:
            cur = con.cursor()
            cur.execute(f"USE {self.db_name}")
            cur.execute(sql, args)
            con.commit()

    # Answer
    def create_answer(self, session_id, page_number):
        verification_id = self.__get_verification_id(session_id, page_number)
        sql = ('INSERT INTO '
                    'Answers ('
                    'FK_SessionId, FK_VerificationId, SEEN_ALEGATIONS, '
                    'CONFIDENCE_BEFORE_ALEGATIONS, CONFIDENCE_AFTER_ALEGATIONS, ANALYSIS_DEEP_ENOUGH, '
                    'MATRIX_PERSUASIVENESS, MATRIX_COHERENCE, MATRIX_COMMON_SENSE, '
                    'MATRIX_RANK_SQ, MATRIX_RANK_PC, MATRIX_RANK_TC, '
                    'MATRIX_RANK_CS, MATRIX_RANK_NE) '
                'VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)')
        args = (session_id, verification_id, *[0 for _ in range(12)])
        with self.__get_connection() as con:
            cur = con.cursor()
            cur.execute(f"USE {self.db_name}")
            cur.execute(sql, args)
            con.commit()

    def update_answer(self, participant_hash, page_number, answers, in_initial_question):
        verification_id = self.__get_verification_id(participant_hash, page_number)
        if in_initial_question:
            sql = ('UPDATE '
                    'Answers SET '
                    'SEEN_ALEGATIONS=%s, CONFIDENCE_BEFORE_ALEGATIONS=%s '
                'WHERE '
                    'FK_SessionId=%s AND FK_VerificationId=%s')
            args = (
                answers.get('question_sa'),
                answers.get('question_cba'),
                participant_hash,
                verification_id
            )
        else:
            sql = ('UPDATE '
                    'Answers SET '
                    'CONFIDENCE_AFTER_ALEGATIONS=%s, ANALYSIS_DEEP_ENOUGH=%s, MATRIX_PERSUASIVENESS=%s, '
                    'MATRIX_COHERENCE=%s, MATRIX_COMMON_SENSE=%s, MATRIX_RANK_SQ=%s, '
                    'MATRIX_RANK_PC=%s, MATRIX_RANK_TC=%s, MATRIX_RANK_CS=%s, '
                    'MATRIX_RANK_NE=%s '
                'WHERE '
                    'FK_SessionId=%s AND FK_VerificationId=%s')
            args = (
                answers.get('question_caa'),
                answers.get('question_de'),
                answers.get('matrix_pe'),
                answers.get('matrix_co'),
                answers.get('matrix_cs'),
                answers.get('matrix_rank_sq'),
                answers.get('matrix_rank_pc'),
                answers.get('matrix_rank_tc'),
                answers.get('matrix_rank_cs'),
                answers.get('matrix_rank_ne'),
                participant_hash,
                verification_id
            )
        with self.__get_connection() as con:
            cur = con.cursor()
            cur.execute(f"USE {self.db_name}")
            cur.execute(sql, args)
            con.commit()

    def get_answer(self, participant_id, page_number):
        verification_id = self.__get_verification_id(participant_id, page_number)
        sql = ('SELECT '
                    'SEEN_ALEGATIONS, CONFIDENCE_BEFORE_ALEGATIONS, CONFIDENCE_AFTER_ALEGATIONS,'
                    'ANALYSIS_DEEP_ENOUGH, MATRIX_PERSUASIVENESS, MATRIX_COHERENCE,'
                    'MATRIX_COMMON_SENSE, MATRIX_RANK_SQ, MATRIX_RANK_PC,'
                    'MATRIX_RANK_TC, MATRIX_RANK_CS, MATRIX_RANK_NE '
                'FROM Answers WHERE '
                    'FK_SessionId=%s AND FK_VerificationId=%s')
        args = (participant_id, verification_id,)
        with self.__get_connection() as con:
            cur = con.cursor()
            cur.execute(f"USE {self.db_name}")
            cur.execute(sql, args)
            res = cur.fetchone()
            if res:
                return {
                    "question_sa": res[0],
                    "question_cba": res[1],
                    "question_caa": res[2],
                    "question_de": res[3],
                    "matrix_pe": res[4],
                    "matrix_co": res[5],
                    "matrix_cs": res[6],
                    "matrix_rank_sq": res[7],
                    "matrix_rank_pc": res[8],
                    "matrix_rank_tc": res[9],
                    "matrix_rank_cs": res[10],
                    "matrix_rank_ne": res[11],
                }
            else:
                return None
        
    # Utils
    def get_participant_answer_time(self, participant_id):
        sql = ('SELECT StartTime, LastUpdateTime FROM Sessions WHERE FK_ParticipantId=%s')
        args = (participant_id,)
        participant_status = self.get_participant_status(participant_id)
        with self.__get_connection() as con:
            cur = con.cursor()
            cur.execute(f"USE {self.db_name}")
            cur.execute(sql, args)
            res = cur.fetchone()
            if res:
                return {"answer_time_s": (res[1] - res[0]).seconds, "participant_status": participant_status}
            else:
                return None
    
    def invalidate_session_no_deletion_interests(self, participant_id):
        self.delete_session(participant_id)
        self.update_participant_status(participant_id, 'new')

    def invalidate_session_no_deletion(self, participant_id):
        self.update_participant_status(participant_id, 'new')

    def check_session_is_valid(self, participant_id):
        session_res = self.get_session(participant_id)
        session_exists = session_res is not None
        is_valid = None
        is_prolific = None
        inside_time_limit = None

        if session_res:
            if session_res["is_prolific"]:
                is_valid = True
            else:
                inside_time_limit = session_res["last_update_time"] + datetime.timedelta(minutes=60) > datetime.datetime.now()
                is_valid = inside_time_limit
        else:
            is_valid = False
        return {"is_valid": is_valid, "is_prolific": is_prolific, "inside_time_limit": inside_time_limit, "session_exists": session_exists}
        
    def get_group_counts(self):
        with self.__get_connection() as con:
            cur = con.cursor()
            cur.execute(f"USE {self.db_name}")
            cur.execute(f"SELECT COUNT(*) FROM Participants WHERE TreatmentGroup='{TreatmentType.HUMAN.value}'")
            h_count = cur.fetchone()[0]
            cur.execute(f"SELECT COUNT(*) FROM Participants WHERE TreatmentGroup='{TreatmentType.MACHINE.value}'")
            m_count = cur.fetchone()[0]
        return h_count, m_count

    def __get_verification_id(self, participant_id, page_number):
        assert page_number in [1, 2, 3, 4], "ERROR: get_verification_id requires page_number to be between 1 and 4"
        res = None
        with self.__get_connection() as con:
            cur = con.cursor()
            cur.execute(f"USE {self.db_name}")
            
            cur.execute(f"SELECT FK_VerificationId{str(page_number)} FROM Sessions WHERE FK_ParticipantId=%s", (participant_id,))
            res = cur.fetchone()
            if res:
                res = res[0]
        return res

    def get_verification_data(self, participant_id, page_number):
        assert page_number in [1, 2, 3, 4], "ERROR: get_verification_data requires page_number to be between 1 and 4"
        with self.__get_connection() as con:
            cur = con.cursor()
            cur.execute(f"USE {self.db_name}")
            
            verification_id = self.__get_verification_id(participant_id, page_number)
            if verification_id:
                cur.execute("SELECT V.VerificationText, V.TreatmentType, N.NewsText, V.Verdict "
                "FROM Verifications V JOIN News N ON V.FK_NewsId = N.NewsId WHERE V.VerificationId=%s", (verification_id,))
                verification_data = cur.fetchone()
                if verification_data:
                    res = {
                        "verification_text": verification_data[0],
                        "treatment_type": verification_data[1],
                        "news_text": verification_data[2],
                        "verdict": verification_data[3]
                    }
                    return res
            return None

    def increase_verification_num_uses(self, verification_id, amount: int = 1):
        sql = ('SELECT Num_Uses FROM Verifications WHERE VerificationId=%s')
        with self.__get_connection() as con:
            cur = con.cursor()
            cur.execute(f"USE {self.db_name}")
            cur.execute(sql, (verification_id,))
            res = cur.fetchone()
            if res:
                current_uses = res[0]
                new_uses = current_uses + amount
                sql_update = ('UPDATE Verifications SET Num_Uses=%s WHERE VerificationId=%s')
                args_update = (new_uses, verification_id)
                cur.execute(sql_update, args_update)
                con.commit()
            else:
                raise ValueError(f"VerificationId {verification_id} not found")
        
    def get_verifications_n_uses_and_category(self):
        with self.__get_connection() as con:
            cur = con.cursor()
            cur.execute(f"USE {self.db_name}")
            cur.execute("SELECT V.VerificationId, V.Num_Uses, N.FK_NewsCategoryID, V.TreatmentType FROM Verifications V INNER JOIN News N ON V.FK_NewsId = N.NewsId")
            return [(row[0], row[1], row[2], row[3]) for row in cur.fetchall()]
