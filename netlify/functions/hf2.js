exports.handler = async (event) => {
  console.log('module.exports:', module.exports); console.log('typeof handler:', typeof module.exports.handler);
  try {
    console.log('Received prompt:', event.body);
    const { prompt } = JSON.parse(event.body);
    const HF_URL = 'https://router.huggingface.co/v1/chat/completions';
    
    const response = await fetch(HF_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "moonshotai/Kimi-K2-Instruct-0905",
        messages: [
          //{ role: "system", content: "You are a helpful assistant." },
          { role: "system", content: "You provide strictly one word answers to questions." },
          { role: "user", content: prompt }
        ],
        max_tokens: 50,
        temperature: 0.7,
        stream: false
      })
    });
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    console.log('HF API status:', response.status);
    //const rawData = await response.text(); // Capture raw response first
    //console.log('HF API raw response:', rawData);
    const result = await response.json();
    console.log('result.choices[0].message.content:', result.choices[0].message.content);
    
    return {
      statusCode: 200,
      body: JSON.stringify({message: result.choices[0].message.content}) // Forward raw response to frontend
    };
  } catch (e) {
    console.error('Function error:', e);
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};