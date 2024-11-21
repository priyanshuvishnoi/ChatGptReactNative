export interface ChatGPTResponse {
    id:                 string;
    object:             string;
    created:            number;
    model:              string;
    choices:            Choice[];
    usage:              Usage;
    system_fingerprint: string;
}

export interface Choice {
    index:         number;
    message:       Message;
    logprobs:      null;
    finish_reason: string;
}

export interface Message {
    role:    string;
    content: string;
    refusal: null;
}

export interface Usage {
    prompt_tokens:             number;
    completion_tokens:         number;
    total_tokens:              number;
    prompt_tokens_details:     PromptTokensDetails;
    completion_tokens_details: CompletionTokensDetails;
}

export interface CompletionTokensDetails {
    reasoning_tokens:           number;
    audio_tokens:               number;
    accepted_prediction_tokens: number;
    rejected_prediction_tokens: number;
}

export interface PromptTokensDetails {
    cached_tokens: number;
    audio_tokens:  number;
}
