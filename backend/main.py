from flask import Flask, jsonify
from flask_cors import CORS
from flask import request
import sys
from agents import mainLogicStartsHere

sys.path.insert(0, '..')

app = Flask("__name__")
CORS(app, resources={r"*": {"origins": "http://localhost:3000"}})


@app.route('/conversation',methods=['POST'])
def invokeModel():
    userQry = request.data.decode('utf-8')
    print(userQry)
    res = mainLogicStartsHere(userQry)
    print("res", res['response'])
    return jsonify(res['response'])



if __name__ == "__main__":
    app.run(debug=True)















# python -m venv uip
# uip\Scripts\Activate

# flask --app main --debug run

# pip install Flask
# pip install Flask-Cors
# pip freeze > requirements.txt
# To install use this
# pip freeze > requirements.py