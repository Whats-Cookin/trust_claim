# Runbook for proposed changes with steps

## -- changes:
 1. secure access to prod trust claim DB
 2. change digital ocean droplet to test server with a separate DB for trust claim
 3. maintain digital ocean for Taiga and Aws for trust claim
 4. set-up CI/CD on dev (digital ocean trustclaim server)
 5. rewrite taiga.whatscookin.us to redirect to Taiga.linkedtrust.us
    
## -- steps:
 1. for secure access to prod DB, I'll only allow the Aws prod IP to be the only inbound traffic IP (done)
2. for this, I'll enable the DNS name 'dev.linkedtrust.us' to be the dev domain and the IP being the dev IP, which is on CI/CD with the master branch on both both front and backend repo, also I'll need the digital ocean webhook to be attached to both front and backend repo for me to enable it with Jenkins(done).
3. I'll create a snapshot of the Taiga EC2 in Aws, and turn it down, since all traffic is on the digital ocean droplet, also should I move Taiga dB to a separate DB or leave it as it's usually the local one available in the same server as the program codes (local pg dB)???? -- ( the Taiga board is on a separate pg database now connected in digital ocean and the Aws server is terminated with a snapshot created) 

4. for this, I'll need the webhook for the digital ocean Jenkins to be included to both the front and backend repo (done)
5. I'll use .htaccess / reconfigure ngnix to redirect the traffic to taiga.linkedtrust.us or should I move the Taiga subdomain back to taiga.whatscookin.us, because I used taiga.linkedtrust.us to test the migration, so as not to lose data during the moving of infrastructures, so should I change the domain back to taiga.whatscookin.us (which would require me to go through taiga setups and reconfigure the environments, but it's no big deal. ( I wrote the functionality into ngnix conf file to redirect taiga.whatscookin.us to taiga.linkedtrust.us)

--- This are the steps I do plan on using to solve the tasks at hand, and would also appreciate it if you can look into the questions raised, so I can best know how to go about them with your approval.
