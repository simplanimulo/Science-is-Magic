export const handler = async (event, context) => {
    console.log('test function starts');
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello from Netlify Functionss!" }),
  };
};