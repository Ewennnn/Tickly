Step 1: Base subject
You are in charge of building a new system to handle concerts and events tickets.
You already know that your system will be used by both small business (maybe a school organizing an event) or by international star for a "tour".
Your SaaS system should be able to handle that workload and be optimized as best as you can.
Features:
- API to CRUD (Create, Read, Update, Delete) all informations relatives to events
- API to CRUD all informations relative to users
- API to handle authentification / authorization
- API to handle buying tickets
You will need to send confirmation about each "buy" operation - you can send and email or an SMS confirmation (no need to pay for such service you can just simulate that being an asynchronous call)
You need to have a full operational and easy to deploy solution based on the technologies you choose.
There is no specific recommendation just the end result is expected.
You have to think about the risk for each operation, criticity of each HTTP calls and what could be the impact if some requests are not processed.
In case of some error in the process, the user need to be notified accordingly.
If such scenario happens you need to be able to find logs usefull for debugging purpose
