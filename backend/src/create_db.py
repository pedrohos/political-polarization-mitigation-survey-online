import os
import pandas as pd
import json
import lib.db_utils as db
from src.lib.utils import (
    process_verification_from_dict,
    merge_llm_outputs_into_text,
    extract_textual_information_from_news_block,
    get_llm_outputs_verdict,
    MAP_SCRAPPED_NEWS_TO_AGENT_2
)
import random

os.environ["DB_NAME"] = "survey_db_test"
os.environ["DB_PORT"] = "13306"

# DATA_SAMPLE_PATH = "/home/pedrohos/dev/masters/survey-app/backend/data/sample"
from dotenv import load_dotenv
load_dotenv()

# assert os.environ.get("DATA_SAMPLE_PATH", None), "Expected DATA_SAMPLE_PATH to be set in .env" 
# w = os.environ["DATA_SAMPLE_PATH"]
DATA_SAMPLE_PATH = "/home/pedrohos/dev/masters/survey-app/backend/data/sample"

def populate_db(db_utils: db.DBUtils):
    n_continues = 0
    for sample in sorted(os.listdir(DATA_SAMPLE_PATH)):
        sample_path = os.path.join(DATA_SAMPLE_PATH, sample)
        with open(sample_path) as f:
            data = json.load(f)
        news_verification = process_verification_from_dict(data)
        
        file_id = sample[:-5]
        db_utils.create_news(file_id, news_verification.llm_identified_news, news_verification.category)

        # Really necessary ??? (allow multi block verifications)
        # for idx, news_block in enumerate(news_verification.blocks):
        #     text_from_verification = extract_textual_information_from_news_block(news_block)
        #     verification_file_id = file_id + str("_H_B") + str(idx)
        #     db_utils.create_verification(verification_file_id, text_from_verification, verdict=news_block.label, group="human", news_category_id=file_id)

        # TODO: assert that len(blocks) == 1 because this way The verdict can be assigned to a single news item and to a lupa single verification
        assert len(news_verification.blocks_with_llm_output) == 1, f"Expected 1 block, got {len(news_verification.blocks_with_llm_output)} in file {sample}"

        news_block = news_verification.blocks_with_llm_output[0]
        
        verification_file_id = file_id + str("_H")
        human_verification_text = extract_textual_information_from_news_block(news_block)
        human_verdict = MAP_SCRAPPED_NEWS_TO_AGENT_2[news_block.label]

        machine_verification_file_id = file_id + str("_M")
        machine_verification_text = merge_llm_outputs_into_text(news_block)
        # False verdict overrides other verdicts, and so does inconclusive over true. The precedence is if any of the former appears first:
        # False >>> Inconclusive >>> True
        machine_verdict = get_llm_outputs_verdict(news_block)

        if human_verdict != machine_verdict:
            print("Verdict mismatch skipping file_id:", file_id)
            n_continues += 1
            continue

        # Insert human verification
        db_utils.create_verification(verification_file_id, human_verification_text, verdict=human_verdict, group="human", news_category_id=file_id)
            
        # Insert machine verification
        # TODO: Create machine verifications with graph data
        db_utils.create_verification(machine_verification_file_id, machine_verification_text, verdict=machine_verdict, group="machine", news_category_id=file_id)
    print(f"Skipped {n_continues} files")

# def populate_db_test(db_utils: db.DBUtils):
#     for sample in os.listdir(DATA_SAMPLE_PATH):
#         sample_path = os.path.join(DATA_SAMPLE_PATH, sample)
#         with open(sample_path) as f:
#             data = json.load(f)
#         news_verification = process_verification_from_dict(data)
        
#         file_id = sample[:-5]
#         db_utils.create_news(file_id, news_verification.llm_identified_news, news_verification.category)

#         # Really necessary ???
#         # TODO: assert that len(blocks) == 1 because this way The verdict can be assigned to a single news item and to a lupa single verification
#         # assert len(news_verification.blocks) == 1, f"Expected 1 block, got {len(news_verification.blocks)} in file {sample}"
#         for idx, news_block in enumerate(news_verification.blocks):
#             text_from_verification = extract_textual_information_from_news_block(news_block)
#             verification_file_id = file_id + str("_H_B") + str(idx)
#             db_utils.create_verification(verification_file_id, text_from_verification, verdict=news_block.label, group="human", news_category_id=file_id)

#         if len(news_verification.blocks) == 0:
#             continue

#         # RANDOM JUST FOR TEST SAKE
#         machine_verification_file_id = file_id + str("_M")
#         selected_block = random.choice(news_verification.blocks)
#         db_utils.create_verification(machine_verification_file_id, text_from_verification, verdict=selected_block.label, group="machine", news_category_id=file_id)


def main():
    utils = db.DBUtils()
    populate_db(utils)


if __name__ == '__main__':
    main()
