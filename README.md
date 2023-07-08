Run:

    docker-compose build && docker-compose up


Stack:

    I used Node.js and express for API, mongoDB for database,
    for tasks queue I used rabbitmq.


Architecture:
        
    I implemented those 3 scripts that I want to run as microservices:
        -server: listen to endpoints;
        -jobManager: lookup for domains that currently needs an update and queue tasks accordingly;
        -updateData: consume tasks from the queue; run twice a day(configurable)
    Additionally I have also specified a mongo docker and rabbitmq docker in the docker-compose.
    In the db I chose to save the desired data is a json that maps services(whoIs, virusTotal) 
    to their responses.I save the last update time in a json that maps services(whoIs, virusTotal)
    to update time in unix time.I used an index on lastUpdate so that the job manager can lookup
    for expired domains efficiently.
        
    Task manager: The task manager will go over the domains that require
        update and send them in batches of 10  (configurable) to the queue.
        the update data job will run twice a day(configurable) and will clean the queue.
    
    Note: Since it is possible that the job manager will send the same domain in consecutive
        runs(for example if the update data is broken),a different approach would be to store in
        the database for every domain if it is pending,updating,error state, but since we want to update
        the data every 30 days(or so), the current approach should not generate to much overhead.
    
    Scheduling: I used js interval, other approaches would be to use cron
                or lambda if in a cloud environment.


Scale-up

        Since I work in localhost environment I didn't implement load balancer.In the cloud I would
        use API gateway.
        Also I can scale the update data docker containers according the queue state
        and I can scale the server according to load.



