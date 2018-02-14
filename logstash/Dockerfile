FROM logstash

WORKDIR /app

COPY config/logstash.conf /usr/share/logstash/pipeline/

CMD ["-f", "/usr/share/logstash/pipeline/logstash.conf"]