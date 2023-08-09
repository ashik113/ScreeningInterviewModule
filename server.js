// server.js
const express = require("express");
const { Configuration, OpenAIApi } = require("openai");
const bodyParser = require("body-parser");
const evaluateResponse = require("./evaluation"); // Import the function

const path = require("path");

const app = express();
app.use(bodyParser.urlencoded({ extended: true })); // Use body-parser middleware
app.use(bodyParser.json()); // Use JSON body parser middleware

const port = 3000; // You can change this port number if needed
// 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
// sk-lLlLHnfNlwU8bq0FSmBWT3BlbkFJB1L4qvwSQIq4233njcw
// Configure OpenAI API
const config = new Configuration({
    apiKey: "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",
});

const openai = new OpenAIApi(config);

// Define a route to render the HTML page
app.get("/", async (req, res) => {
    const prompt = `
    {
		"prompt": "What is Python programming language. Return response in the following parsable JSON format:\n\n{\"Q\": \"question\", \"A\": \"answer\"}\n\n",
		"max_tokens": 2048,
		"temperature": 1
	}`;
    
    
    const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: prompt,
        max_tokens: 2048,
        temperature: 1,
    });

      
    const parsableJSONresponse = response.data.choices[0].text.trim();
    const parsedResponse = JSON.parse(parsableJSONresponse);

    if (!parsableJSONresponse.startsWith('T')) {
        // Parse the JSON response
        let parsedResponse;
        try {
            parsedResponse = JSON.parse(parsableJSONresponse);
            
    
        } catch (error) {
            console.error("Error parsing JSON response:", error);
        }
    } else {
        console.error("Response starts with 'T', invalid response format.");
    }


    // const scriptContent = require("fs").readFileSync("script.js", "utf-8");

    const correctAnswer = parsedResponse.A;


    app.post("/saveUserResponse", (req, res) => {
        
        const userResponse = req.body.userResponse; // Get the user response from the request body
    
        // Do something with the user response (e.g., process, store, etc.)
        const rank = evaluateResponse(userResponse, correctAnswer);
        console.log(`Keyword Match Rank: ${rank}`);
        
        // Return a response (optional)
        res.json({ message: "User response received and processed." });
    });
    
    // const userResponse = "Python is an programming language for web development";
    // const rank = evaluateResponse(userResponse, correctAnswer);
    // console.log(`Keyword Match Rank: ${rank}`);

     

    // Render the HTML page with the dynamic data
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Screening Interview</title>
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
        <link rel="stylesheet" href="styles.css">
        <script>function submitResponse() {
            const userResponseTextArea = document.getElementById("userResponse");
            const userResponse = userResponseTextArea.value;
        
            fetch("/saveUserResponse", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userResponse }), // Send the user response as JSON data
            })
            .then(response => response.json())
            .then(data => {
                console.log(data); // Log the response from the server (for testing)
                // You can update the UI or perform further actions based on the server response
            })
            .catch(error => {
                console.error("Error:", error);
            });
        }
        </script>

    </head>
    <body>
        <div class="container text-center mt-5">
            <div class="jumbotron bg-light shadow">
                <h1>Interview Questions</h1>
                <div class="jumbotron bg-white">
                    <h4 id="question_id">${parsedResponse.Q}</h4>
                    <h4 id="question_id1">${parsedResponse.A}</h4>

                    <a href="/" class="btn btn-primary">Next</a>
                </div>
            </div>
        </div>

        <div class="container text-center my-5">
            <div class="jumbotron bg-light shadow">
                <h2>Share Your Thoughts</h2>
                <textarea id="userResponse" class="form-control" rows="5" placeholder="Enter your response here"></textarea>
                <button id="submitR" class="btn btn-primary mt-3" onclick="submitResponse()">Submit</button>
                </div>
        </div>

        <!-- Add Bootstrap JS and Popper.js links -->
        <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/2.10.2/umd/popper.min.js"></script>
        <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
    </body>
    </html>
    `);
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
