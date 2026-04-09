## Taks done:

### Prelim Setups

* Created the folder structure
    progress_tracker/
    │
    ├── app.py
    ├── data.json
    │
    ├── templates/
    │   ├── dashboard.html
    │   └── add.html
    │
    ├── static/
    │   ├── style.css
    │   └── script.js
    │
    ├── JOURNAL.md
    └── README.md


* Added some dummy values in the `data.json` file
* Added basic structure of `app.py` file

* Created a conda environment: `progress_tracker_env` with python 3.14 (installed flask too)
* Connected to git repo:
    git init
    git add .
    git commit -m "First commit : message"

    - Then add a new repo to github
    - Copy the url

    git remote add origin <url>
    git push -u origin master 

-----------

### Testing the basic working

* And tested if the data from the .json file is loaded correctly using:

    <pre>
        {{ data }}
    </pre>

    <ul>
        {% for test in data %}
        <li>
            {{ test.testName }}: Physics-{{ test.physics }}.... Total-{{ test.total }}
        </li>
        {% endfor %}
    </ul>

-- Now the flow is, `data.json`'s data is taken by the `app.py` file route and then passed to `dashboard.html` as data. It process it and displays


* Tried to plot the loaded values using chat.js as follows (inside the dashboard.html):

    <canvas id="myChart"></canvas>

    <script>
        const rawData = {{ data | tojson }};

        const labels = rawData.map(item => item.testName);
        const totals = rawData.map(item => item.total);

        const ctx = document.getElementById('myChart');

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Total Marks',
                    data: totals
                }]
            }
        });
    </script>


-----------

### Styling & Improoving the graphs

* Added `options` variable in the chart

* Added a `myChart` for all the common things of a plot
* Added a `updateChart` function to plot for each data it gets (instead of repeating the same plotting logic for each subject's data)
* Added buttons for each subject and fucntion which calls the `updateChart` function with respective subject's marks

* Add new test's data button added in UI



* Removed the testing parts from dashboard
* Corrected style.css and script.js files linking
* Improved the `myChart` variable



### Add.html features

* Added a form for `add.html` file
* Implemented the `add_data()` logic in `app.py`
