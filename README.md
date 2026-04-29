# eats-uiuc

  
# Setup
To setup the project, run these commands:

```bash
npm install
python -m venv .venv
.venv/Scripts/activate # Windows
# OR
source .venv/bin/activate # macOS
pip install -r requirements.txt
```
Then create a .env file in the root directory with these lines:
```
FLASK_DEBUG=true
```
# Running the project
To run the project, run this command to start the flask server locally:
```bash
flask --app app run
```
