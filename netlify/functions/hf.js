exports.handler = async (event) => {

  try {
    console.log('Received prompt:', event.body);
    const { prompt } = JSON.parse(event.body);
    const HF_URL = 'https://api-inference.huggingface.co/models/gpt2'
    //const HF_URL = 'https://jsonplaceholder.typicode.com/posts';
    
    const response = await fetch(HF_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ inputs: prompt })
    });
    
    console.log('HF API status:', response.status);
    const data = await response.text(); // Capture raw response first
    console.log('HF API raw response:', data);
    
    return {
      statusCode: 200,
      body: data // Forward raw response to frontend
    };
  } catch (e) {
    console.error('Function error:', e);
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};