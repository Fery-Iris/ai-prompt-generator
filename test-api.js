require('dotenv/config');
const https = require('https');

const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
console.log('Using key:', key?.substring(0, 12) + '...');

const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=' + key;
const body = JSON.stringify({ contents: [{ parts: [{ text: 'say hello in one word' }] }] });

const req = https.request(url, { method: 'POST', headers: { 'Content-Type': 'application/json' } }, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    if (json.error) {
      console.log('ERROR CODE:', json.error.code);
      console.log('STATUS:', json.error.status);
      console.log('MESSAGE:', json.error.message?.substring(0, 300));
    } else {
      console.log('SUCCESS:', json.candidates?.[0]?.content?.parts?.[0]?.text);
    }
  });
});
req.write(body);
req.end();
