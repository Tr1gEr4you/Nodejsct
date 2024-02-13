const zmq = require('zeromq');
const responser = zmq.Socket('rep');

responser.bind('tcp://127.0.0.1:3000');
console.log('Ready to play...');

responser.on('message', (msg) => {
  const data = JSON.parse(msg.toString());
  console.log(`Received request: ${msg.toString()}`);

  if (data.type === 'start') 
  {
    const min = data.min;
    const max = data.max;
    const secretNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    console.log(`Secret number: ${secretNumber}`);
    responser.send(JSON.stringify({ range: `${min}-${max}` }));
  } 
  else if (data.type === 'guess') 
  {
    const guess = data.guess;
    const secretNumber = data.secretNumber;
    if (guess < secretNumber) 
    {
      responser.send(JSON.stringify({ hint: 'more' }));
    } 
    else if (guess > secretNumber) 
    {
      responser.send(JSON.stringify({ hint: 'less' }));
    } 
    else {
      responser.send(JSON.stringify({ answer: guess }));
    }
  }
});