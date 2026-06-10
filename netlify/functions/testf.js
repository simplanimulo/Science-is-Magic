//export const handler = async (event, context) => { // this causes an error
exports.handler = async (event) => {
    console.log('test function starts');
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello from Netlify Functionss!" }),
  };
};