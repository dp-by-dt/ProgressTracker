from flask import Flask, render_template, redirect, url_for, request
import json
import os


#------ data file path (dynamic)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE_DIR, 'data.json')


#------------ initialising app
app = Flask(__name__) 


#---------- helper functions
def safe_int(value):
    return int(value) if value else 0

def safe_float(value):
    return float(value) if value else 0.0

#--------- routes -------

@app.route('/')
def dashboard():
    with open(DATA_FILE, 'r') as file:
        data = json.load(file)

    return render_template('dashboard.html', data=data)



@app.route('/add', methods=['GET', 'POST'])
def add_data():
    if request.method == 'POST':
        new_entry = {
            "testName": request.form['testName'],
            "testDate": request.form['testDate'],
            "physics": safe_float(request.form['physics']),
            "chemistry": safe_float(request.form['chemistry']),
            "botany": safe_float(request.form['botany']),
            "zoology": safe_float(request.form['zoology']),
            "rank": safe_int(request.form['rank'])
        }

        # calculate total + percentage
        total = (
            new_entry["physics"] +
            new_entry["chemistry"] +
            new_entry["botany"] +
            new_entry["zoology"]
        )

        new_entry["total"] = total
        new_entry["percentage"] = round((total / 720) * 100, 2)

        # load existing data
        with open(DATA_FILE, 'r') as file:
            data = json.load(file)

        # append new data
        data.append(new_entry)

        # save back
        with open(DATA_FILE, 'w') as file:
            json.dump(data, file, indent=4)

        return redirect('/')

    return render_template('add.html')



if __name__ == "__main__":
    app.run(debug=True)