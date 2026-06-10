exports.handler = async (event) => {
  try {
    const { promptObject } = JSON.parse(event.body);
    const response = await fetch(promptObject.API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(promptObject.promptObjectBody)
    });
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    console.log(response);
    const result = await response.json();
    //console.log('result.choices[0].message.content:', result.choices[0].message.content);
    
    return {
      statusCode: 200,
      body: JSON.stringify({message: result.choices[0].message.content})
    };
  } catch (e) {
    console.error('Function error:', e);
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};