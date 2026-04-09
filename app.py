from flask import Flask, render_template, redirect, url_for, request
import json

app = Flask(__name__) #initialising app

@app.route('/')
def dashboard():
    with open('data.json', 'r') as file:
        data = json.load(file)

    return render_template('dashboard.html', data=data)



@app.route('/add', methods=['GET', 'POST'])
def add_data():
    if request.method == 'POST':
        new_entry = {
            "testName": request.form['testName'],
            "testDate": request.form['testDate'],
            "physics": float(request.form['physics']),
            "chemistry": float(request.form['chemistry']),
            "botany": float(request.form['botany']),
            "zoology": float(request.form['zoology']),
            "rank": int(request.form['rank'])
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
        with open('data.json', 'r') as file:
            data = json.load(file)

        # append new data
        data.append(new_entry)

        # save back
        with open('data.json', 'w') as file:
            json.dump(data, file, indent=4)

        return redirect('/')

    return render_template('add.html')



if __name__ == "__main__":
    app.run(debug=True)