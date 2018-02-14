// --- Consul ---

var consul = require('consul')({
  host: 'consul'
});

consul.kv.set('redis/test', 'HI', function(err, result) {
  if (err) throw err;  
});


// --- Logstash ---

var Logstash = require('logstash-client');
console.log('Starting logstash...');
 
var logstash = new Logstash({
  type: 'udp', // udp, tcp, memory 
  host: 'logstash',
  port: 9563
});
console.log('Write...');
logstash.send('message', () => {
  console.log('++++++++ write correct!!! ++++++++');
});
console.log('End logstash...');



// --- Producer ---
const ENABLE_SEND_DATA_BY_PRODUCER = false;

var rdkafka = require('node-rdkafka');

var producer = new rdkafka.Producer({
  'metadata.broker.list': 'kafka',
  'dr_cb': true,
});
console.log('Starting...');
producer.connect();

var consumer = new rdkafka.KafkaConsumer({
  'group.id': 'kafka',
  'metadata.broker.list': 'kafka:9092',
}, {});
consumer.connect();


consumer
  .on('ready', function(data) {
    console.log('Ready to catch messages...', data);
    // Subscribe to the librdtesting-01 topic
    // This makes subsequent consumes read from that topic.
    consumer.subscribe(['topic']);
    consumer.consume();
  })
  .on('data', function(data) {
    console.log('Message found!  Contents below.');
    console.log(data.value.toString());

    consul.kv.get('redis/test', function(err, result) {
      if (err) throw err;
        if (ENABLE_SEND_DATA_BY_PRODUCER) {
          try {          
            producer.produce(
              // Topic to send the message to
              'topic',
              // optionally we can manually specify a partition for the message
              // this defaults to -1 - which will use librdkafka's default partitioner (consistent random for keyed messages, random for unkeyed messages)
              null,
              // Message to send. Must be a buffer
              new Buffer(result.Value),
            );
            console.log('Message has been sent...');
          } catch (err) {
            console.error('A problem occurred when sending our message');
            console.error(err);
          }          
        }
      console.log('+++', result.Value);
    });    
  });

// Wait for the ready event before proceeding


// Any errors we encounter, including connection errors
producer.on('event.error', (err) => {
  console.error('Error from producer');
  console.error(err);
})


// --- Consumer ---