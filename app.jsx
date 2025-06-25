import React, { useState } from 'react';

// Main App component for the Bad Lippspringe AI Assistant
const App = () => {
  // State to store the user's question input
  const [question, setQuestion] = useState('');
  // State to store the AI's answer
  const [answer, setAnswer] = useState('Ask me anything about Bad Lippspringe!');
  // State to store the last question asked by the user
  const [lastAskedQuestion, setLastAskedQuestion] = useState('');
  // State to manage loading indicator visibility
  const [isLoading, setIsLoading] = useState(false);
  // State for error messages
  const [error, setError] = useState('');

  /**
   * Handles the form submission to send the question to the AI.
   * @param {Event} e - The form submission event.
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior (page reload)

    if (!question.trim()) {
      setError('Please enter a question.');
      return;
    }

    setIsLoading(true); // Show loading indicator
    setError(''); // Clear previous errors
    setAnswer(''); // Clear previous answer
    setLastAskedQuestion(question); // Store the current question for display
    setQuestion(''); // Clear the input query area after submission

    // Construct the prompt for the AI model.
    // Explicitly emphasizing NO MARKDOWN CODE BLOCKS.
    const prompt = `
      You are an AI assistant specialized exclusively in providing information about **Bad Lippspringe, Germany**.
      Your sole purpose is to answer questions related to **Bad Lippspringe**.
      **Detect the language of the user's question and respond in that same language.**
      When providing recommendations or lists of activities that are suitable for a table, generate ONLY the **complete HTML table** with Tailwind CSS classes for styling.

      **CRITICAL: DO NOT EVER WRAP THE HTML TABLE IN MARKDOWN CODE BLOCKS (e.g., no \`\`\`html\` or \`\`\` tags around the <table> element). The response should start directly with <table> and end with </table> if a table is generated.**

      **The HTML table must have one column:**
      1.  'Recommendation' (the specific detail, recommendation, or piece of information)

      **Table Styling Requirements:**
      * The main \`<table>\` element should have \`class="w-full border-collapse table-auto text-left"\`.
      * Table headers (\`<th>\`) within \`<thead>\` should have \`class="px-4 py-3 bg-blue-500 text-white uppercase text-sm leading-normal"\` and be bold.
      * Table data cells (\`<td>\`) within \`<tbody>\` should have \`class="border border-gray-200 px-4 py-3 text-sm"\`.
      * Use \`<tr>\` tags for rows.

      **Important Rules:**
      1.  If a user asks *any* question that is **NOT** directly or indirectly about **Bad Lippspringe**, you **MUST** respond with: "I'm really sorry, but I'm designed to assist only with information about Bad Lippspringe. Could you please check your question and ask again about something related to Bad Lippspringe? I'd be happy to help you!" Ensure this specific response is also in the detected language of the user's initial question. Do not provide any other information or attempt to answer the question, and **do not use an HTML table for this specific response**.
      2.  If the question is about Bad Lippspringe, provide a concise and helpful answer based on your knowledge, formatted as described above in a styled HTML table. If a tabular format doesn't make sense for the answer (e.g., a simple yes/no question that cannot be categorized), then provide a concise plain text answer (no HTML table), still in the detected language.

      User's question: ${question}
    `;

    // chatHistory to be sent to the Generative AI API
    let chatHistory = [];
    chatHistory.push({ role: "user", parts: [{ text: prompt }] });

    const payload = {
      contents: chatHistory,
      generationConfig: {
        // These settings can be adjusted for creativity vs. factual accuracy
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
      },
    };

    // API key for the Gemini API. Canvas will provide this at runtime.
    const apiKey = "";
    // API URL for the gemini-2.0-flash model
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      // Check if the network response was OK (status 200-299)
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const result = await response.json();

      // Check if the response structure is as expected and extract the text
      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        setAnswer(result.candidates[0].content.parts[0].text);
      } else {
        // Handle cases where the response structure is unexpected or content is missing
        setAnswer('Sorry, I could not generate a response. Please try again.');
      }
    } catch (err) {
      console.error("Error communicating with AI:", err);
      setError(`Failed to get a response: ${err.message}. Please try again later.`);
      setAnswer('An error occurred. Please check the console for details.');
    } finally {
      setIsLoading(false); // Hide loading indicator
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 flex items-center justify-center p-4 font-sans">
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-6 text-center">
          Bad Lippspringe AI Assistant
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <textarea
              className="w-full p-4 pr-12 border-2 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out resize-none h-28 text-gray-700 placeholder-gray-500"
              placeholder="Ask me a question about Bad Lippspringe..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows="4"
            ></textarea>
            {/* Optional: A submit icon inside the textarea for quick submit on mobile */}
            <button
              type="submit"
              className="absolute right-3 bottom-3 p-2 bg-blue-600 text-white rounded-full shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200 ease-in-out"
              aria-label="Send question"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>

          {error && (
            <p className="text-red-600 text-sm text-center">{error}</p>
          )}

          {/* Moved the main submit button here for clarity, though the icon inside textarea is also functional */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-blue-700 transition duration-200 ease-in-out shadow-lg transform hover:scale-105"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              'Ask AI'
            )}
          </button>
        </form>

        <div className="mt-8 bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-inner min-h-[150px] flex flex-col justify-between">
          <h2 className="text-xl font-bold text-gray-800 mb-3 border-b pb-2">Your Question:</h2>
          <p className="text-gray-600 leading-relaxed italic mb-4">{lastAskedQuestion}</p>

          <h2 className="text-xl font-bold text-gray-800 mb-3 border-b pb-2">Bali Response:</h2>
          {/* Using dangerouslySetInnerHTML to render HTML from the AI response */}
          <div className="text-gray-700 leading-relaxed flex-grow" dangerouslySetInnerHTML={{ __html: answer }} />
          <p className="text-xs text-gray-500 mt-4 text-right italic">
            Powered by Gemini AI
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;
