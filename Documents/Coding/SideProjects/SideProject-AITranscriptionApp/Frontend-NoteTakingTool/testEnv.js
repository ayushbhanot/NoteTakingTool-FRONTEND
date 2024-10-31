require('dotenv').config();  // Ensure this line is at the top to load environment variables

console.log("OpenAI API Key:", process.env.REACT_APP_OPENAI_API_KEY);
console.log("Google Credentials Path:", process.env.REACT_APP_GOOGLE_APPLICATION_CREDENTIALS);
