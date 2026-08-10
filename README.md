# DevSecOps Vulnerable Lab

This application is intentionally vulnerable. Use it only on your own local machine/lab.

## Goal

You will practice:

1. SAST with SonarQube
2. SCA with npm audit / dependency scanning
3. DAST with OWASP ZAP
4. Fix -> rescan -> verify
5. SonarQube Quality Gate configuration
6. Explaining findings like a DevOps/AppSec engineer

## Important

Do NOT expose this application to the public Internet or deploy it to a real production cluster.

## Run locally

```bash
npm install
npm start
```

Then open:

http://localhost:3000

## Useful endpoints

- GET /user?username=admin
- GET /search?q=hello
- GET /ping?host=127.0.0.1
- POST /token
- POST /merge
- GET /fetch?url=http://example.com
- GET /debug

The vulnerabilities are deliberate and are for defensive security training.
