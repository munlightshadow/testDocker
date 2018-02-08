console.log('Ready to produce -1..');
let rdkafka = require('node-rdkafka');
console.log('Ready to produce 0..');

let producer = new rdkafka.Producer({
    'client.id': 'topic',
  'group.id': 'topic',
  'metadata.broker.list': 'kafka:9092',
  'dr_cb': true,
    'event_cb': true,
});

console.log('Ready to produce 1..');
// Connect to the broker manually
producer.connect(function(err) {
    console.log(err)
});
console.log('Ready to produce 2..');

// Wait for the ready event before proceeding
producer.on('ready', () => {
  console.log('Ready to produce..');
  try {
    producer.produce(
      // Topic to send the message to
      'topic',
      // optionally we can manually specify a partition for the message
      // this defaults to -1 - which will use librdkafka's default partitioner (consistent random for keyed messages, random for unkeyed messages)
      0,
      // Message to send. Must be a buffer
      new Buffer('Awesome message222'),
      // for keyed messages, we also specify the key - note that this field is optional
      // 'Stormwind',
      // you can send a timestamp here. If your broker version supports it,
      // it will get added. Otherwise, we default to 0
      // Date.now(),
      // you can send an opaque token here, which gets passed along
      // to your delivery reports
    );
  } catch (err) {
    console.error('A problem occurred when sending our message');
    console.error(err);
  }
});

// Any errors we encounter, including connection errors
producer.on('event.error', (err) => {
  console.error('Error from producer');
  console.error(err);
});

producer.setPollInterval(100);

producer.on('delivery-report', function(err, report) {
  // Report of delivery statistics here:
  //
  console.log(report);
});

producer.on('event.stats', function(err, report) {
  // Report of delivery statistics here:
  //
  console.log(err, report);
});



var consumer = new rdkafka.KafkaConsumer({
  'group.id': 'topic',
  'event_cb': true,
  'metadata.broker.list': 'kafka:9092',
'offset_commit_cb': function(err, topicPartitions) {

    if (err) {
      // There was an error committing
      console.error(err);
    } else {
      // Commit went through. Let's log the topic partitions
      console.log(topicPartitions);
    }
 
  }
}, {});

// Flowing mode
consumer.connect(function(err) {
    console.log(err)
});

consumer
  .on('ready', function() {
    console.log('Ready for serving..');
    consumer.subscribe(['topic']);

    var kkk = 0;;

    // Consume from the librdtesting-01 topic. This is what determines
    // the mode we are running in. By not specifying a callback (or specifying
    // only a callback) we get messages as soon as they are available.
    setInterval(function() {
      console.log('waiting...' + ++kkk);
      consumer.consume(1);
    }, 400);
    //consumer.consume();
  })
  .on('data', function(data) {
    // Output the actual message contents
    console.log(data);
  })
  .on('event', function(data) {
    // Output the actual message contents
    console.log(data);
  })
  .on('event.stats', function(data) {
    // Output the actual message contents
    console.log(data);
  });





