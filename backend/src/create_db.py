import os
import pandas as pd
import json
import lib.db_utils as db
from lib.utils import process_verification_from_dict, extract_textual_information_from_verification, extract_textual_information_from_news_block
import random

DATA_SAMPLE_PATH = "/home/pedrohos/dev/masters/survey-app/backend/data/sample"

def populate_db(db_utils: db.DBUtils):
    for sample in os.listdir(DATA_SAMPLE_PATH):
        sample_path = os.path.join(DATA_SAMPLE_PATH, sample)
        with open(sample_path) as f:
            data = json.load(f)
        news_verification = process_verification_from_dict(data)
        
        file_id = sample[:-5]
        db_utils.create_news(file_id, news_verification.llm_identified_news, news_verification.category)

        # Really necessary ???
        # TODO: assert that len(blocks) == 1 because this way The verdict can be assigned to a single news item and to a lupa single verification
        # assert len(news_verification.blocks) == 1, f"Expected 1 block, got {len(news_verification.blocks)} in file {sample}"
        for idx, news_block in enumerate(news_verification.blocks):
            text_from_verification = extract_textual_information_from_news_block(news_block)
            verification_file_id = file_id + str("_H_B") + str(idx)
            db_utils.create_verification(verification_file_id, text_from_verification, verdict=news_block.label, group="human", news_category_id=file_id)

        if len(news_verification.blocks) == 0:
            continue
            
        # TODO: Create machine verifications with graph data
        # for machine_sample in ...
        # machine_verification_file_id = file_id + str("_M")
        # db_utils.create_verification(machine_verification_file_id, text_from_verification, verdict=block.label, group="machine", news_category_id=file_id)


def populate_db_test(db_utils: db.DBUtils):
    for sample in os.listdir(DATA_SAMPLE_PATH):
        sample_path = os.path.join(DATA_SAMPLE_PATH, sample)
        with open(sample_path) as f:
            data = json.load(f)
        news_verification = process_verification_from_dict(data)
        
        file_id = sample[:-5]
        db_utils.create_news(file_id, news_verification.llm_identified_news, news_verification.category)

        # Really necessary ???
        # TODO: assert that len(blocks) == 1 because this way The verdict can be assigned to a single news item and to a lupa single verification
        # assert len(news_verification.blocks) == 1, f"Expected 1 block, got {len(news_verification.blocks)} in file {sample}"
        for idx, news_block in enumerate(news_verification.blocks):
            text_from_verification = extract_textual_information_from_news_block(news_block)
            verification_file_id = file_id + str("_H_B") + str(idx)
            db_utils.create_verification(verification_file_id, text_from_verification, verdict=news_block.label, group="human", news_category_id=file_id)

        if len(news_verification.blocks) == 0:
            continue

        # RANDOM JUST FOR TEST SAKE
        machine_verification_file_id = file_id + str("_M")
        selected_block = random.choice(news_verification.blocks)
        db_utils.create_verification(machine_verification_file_id, text_from_verification, verdict=selected_block.label, group="machine", news_category_id=file_id)


def main():
    utils = db.DBUtils()
    populate_db_test(utils)


if __name__ == '__main__':
    main()
