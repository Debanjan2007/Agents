import dotenv from 'dotenv'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import readline from 'node:readline/promises'

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

// System classes 
// Readline object
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});
// Aborting signal
const signal = AbortSignal.timeout(10_000) // 10 seconds -> I didn't know that nodejs allows '_' as commas in numeric values and that has no effect on execution => SO this 10_000 means 10,000 milliseconds or 20 seconds , just read it through the nodejs docs.

const gemini = new OpenAI({
    baseURL: process.env.GEMINI_BASE_URL,
    apiKey: process.env.GEMINI_API_KEY,
})

const model = new OpenAIChatCompletionsModel(
    gemini,
    'gemini-3.5-flash-lite'
)

let thread = [] // for sharing the memory in a single chat , but i don't know when it gonna start halluciante due to memory overloading.

const agent = new Agent({
    name: 'Weather-Email-agent',
    instructions: 'You are a specialized friendly agent that can talk to users casually , tell the user how is the weather right now in the given place and then if the user wants you to send it in email you can send that to their email as both html and simple text as a standard mail is send',
    model,
})

// main run function
const runner = async (q) => {
    try {
        thread.push({ role: 'User', content: q })
        const result = await run(agent, thread)
        thread = result.history
        console.log("Finaloutput : ", result.finalOutput);
    } catch (err) {
        console.log(err.error[0].error.message);
    }
}

const main = async () => {
    let isChatting = true;
    while (isChatting) {
        try {
            console.log("start your chat")
            const querry = await rl.question("> ", { signal }) // here we can pass that signal and is there is no input within 10s the question will be aborted
            console.log("Querry : ",querry);
            
            if (querry === "exit") {
                isChatting = false
                continue
            }
            await runner(querry)
        } catch (err) {
            if (err.name === "AbortError" || err.name === 'TimeoutError') {
                console.log("Session tiemdout!........");
                isChatting = false
            }
        }
    }
    console.log("! Aborting !");
    rl.close()
}

main()