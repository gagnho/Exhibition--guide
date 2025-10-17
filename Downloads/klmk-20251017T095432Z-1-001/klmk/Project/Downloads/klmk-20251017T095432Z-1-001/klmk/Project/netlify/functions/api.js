const { MongoClient } = require('mongodb');
const uri = process.env.MONGODB_URI;

exports.handler = async (event) => {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const database = client.db('exhibition');
    const visitors = database.collection('visitors');

    if (event.path === '/.netlify/functions/api/visitors') {
      if (event.httpMethod === 'GET') {
        const doc = await visitors.findOne({});
        return {
          statusCode: 200,
          body: JSON.stringify({ count: doc ? doc.count : 0 })
        };
      } else if (event.httpMethod === 'POST') {
        const result = await visitors.findOneAndUpdate(
          {},
          { $inc: { count: 1 } },
          { upsert: true, returnDocument: 'after' }
        );
        return {
          statusCode: 200,
          body: JSON.stringify({ 
            count: result.value.count,
            visitorNumber: result.value.count
          })
        };
      }
    }

    return { statusCode: 404 };
  } catch (error) {
    return { statusCode: 500, body: error.toString() };
  } finally {
    await client.close();
  }
};
