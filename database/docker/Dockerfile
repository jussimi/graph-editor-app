FROM postgres:12.2

RUN mkdir /logs 
RUN touch /logs/postgresql.log
RUN chmod -R 777 /logs 

COPY ./init.sh /docker-entrypoint-initdb.d

EXPOSE 5432

CMD ["-c", "logging_collector=on", "-c", "log_directory=/logs", "-c", "log_filename=postgresql.log", "-c", "log_statement=all"]]