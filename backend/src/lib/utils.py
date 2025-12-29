import numpy as np
import hashlib
import json
from src.lib.models import (
    NewsBlock,
    NewsVerificationImproved,
    NewsVerificationImprovedLLMOutput,
    NewsBlockWithLLMOutput,
    TextComponent,
    ImageComponent,
    VideoComponent
)

def process_verification_from_dict(data: dict) -> NewsVerificationImprovedLLMOutput:
    """
    Processes a verification dict and returns a NewsVerification object.
    This function is a placeholder for the actual processing logic.
    """
    return NewsVerificationImprovedLLMOutput(**data)

def extract_textual_information_from_verification(
    verification: NewsVerificationImprovedLLMOutput,
) -> str:
    """
    Extracts textual information from the verification object.
    This function is a placeholder for the actual extraction logic.
    """
    text_content = []
    for news_block in verification.blocks_with_llm_output:
        text_content.append(extract_textual_information_from_news_block(news_block))

    return "\n".join(text_content)

def extract_textual_information_from_news_block(
    news_block: NewsBlockWithLLMOutput,
) -> str:
    """
    Extracts textual information from the verification object.
    This function is a placeholder for the actual extraction logic.
    """
    text_content = []
    for block_component in news_block.blocks:
        if isinstance(block_component, TextComponent):
            text_content.append(block_component.markdown_text)
        elif isinstance(block_component, ImageComponent):
            text_content.append(block_component.transcript.markdown_text)
        elif isinstance(block_component, VideoComponent):
            text_content.append(block_component.transcript.markdown_text)

    return "\n".join(text_content)

def merge_llm_outputs_into_text(
    news_block: NewsBlockWithLLMOutput,
) -> str:
    
    assert isinstance(news_block.summarized_result, str), "[ERRO] Expected summarized_result of type str"
    if len(news_block.llm_agent_outputs) > 1:
        return "\n\n".join(news_block.llm_agent_outputs + [news_block.summarized_result])
    else:
        return news_block.llm_agent_outputs[0]
    
    

def get_llm_outputs_verdict(
        news_block: NewsBlockWithLLMOutput
    ):
    if len(news_block.llm_verdicts) == 1:
        return news_block.llm_verdicts[0]
    
    verdicts = list(map(str.lower, news_block.llm_verdicts))

    if "falso" in verdicts:
        return "falso"
    if "inconclusivo" in verdicts:
        return "inconclusivo"
    if "verdadeiro" in verdicts:
        return "verdadeiro"
    raise Exception("Unexpected verdict type in verdicts", verdicts)
        


def select_group(h_count, m_count, p_count):
    groups = ['human', 'machine', 'placebo']
    counts = [h_count, m_count, p_count]
    min_count = min(counts)
    eligible_groups = [group for group, count in zip(groups, counts) if count == min_count]
    return np.random.choice(eligible_groups)


def select_tweets(tweets):
    left_tt = [tweet for tweet in tweets if tweet.startswith('L')]
    right_tt = [tweet for tweet in tweets if tweet.startswith('R')]
    left_samples = np.random.choice(left_tt, 2, replace=False)
    right_samples = np.random.choice(right_tt, 2, replace=False)
    assigned_tweets = np.concatenate((left_samples, right_samples))
    np.random.shuffle(assigned_tweets)
    return assigned_tweets


def shuffle_texts(texts):
    np.random.shuffle(texts)
    return texts

def create_hash(password: str) -> str:
    return hashlib.sha512(password.encode('utf-8')).hexdigest()

def verify_hash(password: str, hash: str) -> bool:
    return create_hash(password) == hash

MAP_SCRAPPED_NEWS_TO_AGENT_2 = {
    'Falso': "falso",
    'Falta contexto': "inconclusivo",
    'Verdadeiro': "verdadeiro",
    'Exagerado': "inconclusivo",
    'Insustentável': "inconclusivo",
    'Subestimado': "inconclusivo",
    'Inconclusivo': 'inconclusivo'
}