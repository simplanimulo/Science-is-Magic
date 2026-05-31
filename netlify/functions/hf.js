exports.handler = async (event) => {
    console.log('Eh?');
    const HF_URL = 'https://api-inference.huggingface.co/models/gpt2'
    //const HF_URL = 'https://jsonplaceholder.typicode.com/posts';
  try {
    const { prompt } = JSON.parse(event.body);
    const response = await fetch(HF_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ inputs: prompt })
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const data = await response.json();
    return { statusCode: 200, body: JSON.stringify(data) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};