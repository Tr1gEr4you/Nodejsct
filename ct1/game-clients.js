const zmq = require('zeromq');
const require = zmq.Socket('req');

require.connect('tcp://127.0.0.1:3000');
console.log('Connected to server...');

const args = process.argv.slice(2);
const min = parseInt(args[0]);
const max = parseInt(args[1]);

require.send(JSON.stringify({ type: 'start', min, max }));

require.on('message', (msg) => {
  const data = JSON.parse(msg.toString());
  console.log(`Received response: ${msg.toString()}`);

  if (data.range) 
  {
    const range = data.range.split('-');
    const secretNumber = Math.floor(Math.random() * (parseInt(range[1]) - parseInt(range[0]) + 1)) + parseInt(range[0]);
    console.log(`Secret number: ${secretNumber}`);
    require.send(JSON.stringify({ type: 'guess', guess: secretNumber, secretNumber }));
  } 
  else if (data.hint) 
  {
    if (data.hint === 'more') 
    {
      const guess = Math.floor((max + parseInt(range[1])) / 2);
      console.log(`Guessing ${guess}...`);
      require.send(JSON.stringify({ type: 'guess', guess, secretNumber }));
      max = guess - 1;
    } 
    else if (data.hint === 'less') 
    {
      const guess = Math.floor((min + parseInt(range[0])) / 2);
      console.log(`Guessing ${guess}...`);
      require.send(JSON.stringify({ type: 'guess', guess, secretNumber }));
      min = guess + 1;
    }
  } 
  else if (data.answer) 
  {
    console.log(`The secret number was ${data.answer}.`);
  }
});