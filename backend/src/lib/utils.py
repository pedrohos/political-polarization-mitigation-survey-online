import numpy as np
import hashlib
import json
from lib.models import NewsBlock, NewsVerificationImproved, TextComponent, ImageComponent, VideoComponent

def process_verification_from_dict(data: dict) -> NewsVerificationImproved:
    """
    Processes a verification dict and returns a NewsVerification object.
    This function is a placeholder for the actual processing logic.
    """
    return NewsVerificationImproved(**data)

def extract_textual_information_from_verification(
    verification: NewsVerificationImproved,
) -> str:
    """
    Extracts textual information from the verification object.
    This function is a placeholder for the actual extraction logic.
    """
    text_content = []
    for news_block in verification.blocks:
        text_content.append(extract_textual_information_from_news_block(news_block))

    return "\n".join(text_content)

def extract_textual_information_from_news_block(
    news_block: NewsBlock,
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