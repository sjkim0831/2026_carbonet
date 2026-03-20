Carbonet runtime commands

Server path
- /opt/projects/carbonet

Main commands
- sudo systemctl daemon-reload
- sudo systemctl start carbonet
- sudo systemctl restart carbonet
- sudo systemctl stop carbonet
- sudo systemctl status carbonet

Typical deploy flow
1. Replace /opt/projects/carbonet/target/carbonet.jar
2. Run sudo systemctl daemon-reload
3. Run sudo systemctl restart carbonet
4. Run sudo systemctl status carbonet

Notes
- Upload files default to /opt/projects/carbonet/var/file/instt
- DB connection is passed by systemd ExecStart options
