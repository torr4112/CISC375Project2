// Built-in Node.js modules
let fs = require('fs');
let path = require('path');

// NPM modules
let express = require('express');
let sqlite3 = require('sqlite3');


let public_dir = path.join(__dirname, 'public');
let template_dir = path.join(__dirname, 'templates');
let db_filename = path.join(__dirname, 'db', 'usenergy.sqlite3');

let app = express();
let port = 8000;

// open usenergy.sqlite3 database
let db = new sqlite3.Database(db_filename, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.log('Error opening ' + db_filename);
    }
    else {
        console.log('Now connected to ' + db_filename);
    }
});

app.use(express.static(public_dir)); // serve static files from 'public' directory


// GET request handler for home page '/' (redirect to /year/2018)
app.get('/', (req, res) => {
    res.redirect('/year/2018');
});

// GET request handler for '/year/*'
app.get('/year/:selected_year', (req, res) => {
    let year = req.params.selected_year;
    fs.readFile(path.join(template_dir, 'year.html'), 'utf-8', (err, template) => {
        // modify `template` and send response
        // this will require a query to the SQL database
        db.all("SELECT * from Consumption WHERE year = ?", year, function(err, rows) {
            if (err) {
                console.log(err);
            }

            template = template.replace('{{YEAR}}', year);

            let tr = '';
            for (let i = 0; i < rows.length; i++) {
                tr += '<tr>';
                tr += `<td>${rows[i]['year']}</td>`;
                tr += `<td>${rows[i]['coal']}</td>`;
                tr += `<td>${rows[i]['natural_gas']}</td>`;
                tr += `<td>${rows[i]['nuclear']}</td>`;
                tr += `<td>${rows[i]['petroleum']}</td>`;
                tr += `<td>${rows[i]['renewable']}</td>`;
                tr += '</tr>';
            }
            template = template.replace('{{DATA}}', tr);
            res.status(200).type('html').send(template);
        });
    });
});

// GET request handler for '/state/*'
app.get('/state/:selected_state', (req, res) => {
    let state = req.params.selected_state;
    state = state.toUpperCase();
    fs.readFile(path.join(template_dir, 'state.html'), 'utf-8', (err, template) => {
        // modify `template` and send response
        // this will require a query to the SQL database
        db.all("SELECT * from Consumption WHERE state_abbreviation = ?", state, function(err, rows) {
            if (err) {
                console.log(err);
            }

            template = template.replace('{{STATE}}', state);

            let tr = '';
            for (let i = 0; i < rows.length; i++) {
                tr += '<tr>';
                tr += `<td>${rows[i]['year']}</td>`;
                tr += `<td>${rows[i]['coal']}</td>`;
                tr += `<td>${rows[i]['natural_gas']}</td>`;
                tr += `<td>${rows[i]['nuclear']}</td>`;
                tr += `<td>${rows[i]['petroleum']}</td>`;
                tr += `<td>${rows[i]['renewable']}</td>`;
                tr += '</tr>';
            }
            template = template.replace('{{DATA}}', tr);
            res.status(200).type('html').send(template);
        });
    });
});

// GET request handler for '/energy/*'
app.get('/energy/:selected_energy_source', (req, res) => {
    let source = req.params.selected_energy_source;
    console.log(req.params.selected_energy_source);
    fs.readFile(path.join(template_dir, 'energy.html'), 'utf-8', (err, template) => {
        let queryStatement = `SELECT ${source}, year from Consumption`;
        db.all(queryStatement, function(err, rows) {
            if (err) {
                console.log(err);
            }
            template = template.replace("{{TYPE}}", source);

            let tr = '';
            for (let i = 0; i < rows.length; i++) {
                if (i % 51 == 0 && i > 0) {
                    tr += '</tr>';
                }

                if (i % 51 == 0) {
                    tr += '<tr>';
                    tr += `<td>${rows[i]['year']}</td>`;
                    tr += `<td>${rows[i][source]}</td>`;
                } else {
                    tr += `<td>${rows[i][source]}</td>`;
                }
            }
            template = template.replace('{{DATA}}', tr);
            res.status(200).type('html').send(template);
        });
    });
});

app.listen(port, () => {
    console.log('Now listening on port ' + port);
});
