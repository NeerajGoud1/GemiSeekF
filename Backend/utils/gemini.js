import "dotenv/config";

//gemini flash but slow
const getGeminiResponse = async (message) => {
  try {

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: message }],
          },
        ],
      }),
    };

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      options
    );

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (err) {
    res.status(500).send("Error ", err.message);
  }
};

// open ai pretty fast response
// const getGeminiResponse = async (message) => {
//   const options = {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
//     },
//     body: JSON.stringify({
//       model: "gpt-4o-mini",
//       messages: [
//         {
//           role: "developer",
//           content: "You are a helpful assistant., your name is GemiSeek",
//         },
//         {
//           role: "user",
//           content: message,
//         },
//       ],
//     }),
//   };
//   try {
//     console.log(process.env.OPENAI_API_KEY);

//     const response = await fetch(
//       "https://api.openai.com/v1/chat/completions",
//       options
//     );
//     const data = await response.json();
//     console.log("Gemini Response Data: ", data);

//     return data.choices[0].message.content;
//   } catch (err) {
//     // res.status(500).send("Error ", err.message);
//     console.log(err.message);
//   }
// };

export { getGeminiResponse };
