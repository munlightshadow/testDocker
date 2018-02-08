// --- Consul ---
var consul = require('consul')({
  host: 'consul'
});

consul.kv.set('redis/test', 'HI', function(err, result) {
  if (err) throw err;  
});


// --- Producer ---

var rdkafka = require('node-rdkafka');

var producer = new rdkafka.Producer({
  'metadata.broker.list': 'kafka',
  'dr_cb': true,
});
console.log('Starting...');

// Connect to the broker manually
producer.connect();

// Wait for the ready event before proceeding
producer.on('ready', () => {
  console.log('Ready for sending...');
  try {
    producer.produce(
      // Topic to send the message to
      'topic',
      // optionally we can manually specify a partition for the message
      // this defaults to -1 - which will use librdkafka's default partitioner (consistent random for keyed messages, random for unkeyed messages)
      null,
      // Message to send. Must be a buffer
      new Buffer('Awesome message333'),
    );
    console.log('Message has been sent...');
  } catch (err) {
    console.error('A problem occurred when sending our message');
    console.error(err);
  }
});

// Any errors we encounter, including connection errors
producer.on('event.error', (err) => {
  console.error('Error from producer');
  console.error(err);
})


// --- Consumer ---

var consumer = new rdkafka.KafkaConsumer({
  'group.id': 'kafka',
  'metadata.broker.list': 'kafka:9092',
}, {});

// Non-flowing mode
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
      console.log(result);
    });    
  });

