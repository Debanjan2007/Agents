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
    tool
} from '@openai/agents'
import { OpenAI } from 'openai'
import { Resend } from 'resend'
import { z } from 'zod'

setTracingDisabled(true);

// System classes 
// Readline object
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// resend class 
const resend = new Resend(`${process.env.RESEND_API_KEY}`)


const gemini = new OpenAI({
    baseURL: process.env.GEMINI_BASE_URL,
    apiKey: process.env.GEMINI_API_KEY,
})

const model = new OpenAIChatCompletionsModel(
    gemini,
    'gemini-3.5-flash-lite'
)

let thread = [] // for sharing the memory in a single chat , but i don't know when it gonna start halluciante due to memory overloading.

// Tools
// - Tool 1 -> Weather Tool
const weatherTool = tool({
    name: "weatherTool",
    description: "A tool to get the current weather information for a given location.",
    parameters: z.object({
        location: z.string().describe("The location for which to get the weather information."),
    }),
    execute: async ({ location }) => {
        // Simulate fetching weather information for the given location
        try {
            const weatherInfo = await fetch(`https://wttr.in/${location.toLowerCase()}?format=%c+%t`, { responseType: 'text' })
            const weatherData = await weatherInfo.text();
            console.log(weatherData);
            return { weatherInfo: weatherData };
        } catch (error) {
            console.error("Something went wrong", error)
        }
    }
})
// Tool 2 -> Email the user 
// I am using resend here you can use your own logic or add the resend API key
// - 2 : email tool
const sendEmailTool = tool({

    name: "Email tool",
    description: "Tool to send email to the provided email using the this tool",
    parameters: z.object({
        To: z.email().describe("this is the reciepient email"),
        Subject: z.string().describe("Subject of the email"),
        Body: z.string().describe("The `HTML` body")
    }),
    outputType: z.object({
        accepted: z.boolean().describe("Returns true if the mail is sent successfully, otherwise false"),
        error: z.string().optional().describe("Failure reason when the mail could not be sent")
    }),
    execute: async ({ To, Body, Subject }) => {
        const res = await resend.emails.send({
            from: process.env.SENDER_EMAIL,
            to: To,
            subject: Subject,
            html: Body
        })
        console.log(res);
    }
})

const agent = new Agent({
    name: 'Weather-Email-agent',
    instructions: 'You are a specialized friendly agent that can talk to users casually , tell the user how is the weather right now in the given place and then if the user wants you to send it in email you can send that to their email as both html and simple text as a standard mail is send , when you have no tools chat with the person normally and do not just make the weather by yourself if asked for weather just tell them you are unable to fetch the weather detail right now!',
    model,
    tools: [
        weatherTool,
        sendEmailTool
    ]
})

// main run function
const runner = async (q) => {
    try {
        thread.push({ role: 'user', content: q })
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
            // Aborting signal
            const signal = AbortSignal.timeout(20_000) // 20 seconds -> I didn't know that nodejs allows '_' as commas in numeric values and that has no effect on execution => SO this 20_000 means 20,000 milliseconds or 20 seconds , just read it through the nodejs docs.
            console.log("start your chat")
            const querry = await rl.question("> ", { signal }) // here we can pass that signal and is there is no input within 20s the question will be aborted
            console.log("Querry : ", querry);

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