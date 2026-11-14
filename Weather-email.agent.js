import dotenv from 'dotenv'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

dotenv.config({
    path: resolve(dirname(fileURLToPath(import.meta.url)), '.env')
})

import {
    Agent,
    setTracingDisabled,
    OpenAIChatCompletionsModel,
    run,
} from '@openai/agents'
import { OpenAI } from 'openai'

setTracingDisabled(true);

const gemini = new OpenAI({
    baseURL: process.env.GEMINI_BASE_URL,
    apiKey: process.env.GEMINI_API_KEY,
})

const model = new OpenAIChatCompletionsModel(
    gemini,
    'gemini-3.5-flash-lite'
)

const agent = new Agent({
    name: 'Weather-Email-agent',
    instructions: 'You are a specialized agent that can tell the user how is the weather right now in the given place and then if the user wants you to send it in email you can send that to their email as both html and simple text as a standard mail is send',
    model,
})
