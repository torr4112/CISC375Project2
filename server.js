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
        db.all("SELECT * from Consumption WHERE year = ?", year, function(err, rows) {
            if (err || rows.length == 0) {
                res.status(404).send(`There is no data for year ${year}`);
            } else {

                template = template.replace('{{YEAR}}', year);

                let tr = '';
                let coal_count = 0;
                let natural_gas_count = 0;
                let nuclear_count = 0;
                let petroleum_count = 0;
                let renewable_count = 0;
                for (let i = 0; i < rows.length; i++) {
                    let currentTotal = rows[i]['coal'] + rows[i]['natural_gas'] + rows[i]['nuclear'] + rows[i]['petroleum'] + rows[i]['renewable'];
                    coal_count += rows[i]['coal'];
                    natural_gas_count += rows[i]['natural_gas'];
                    nuclear_count += rows[i]['nuclear'];
                    petroleum_count += rows[i]['petroleum'];
                    renewable_count += rows[i]['renewable'];
    
                    tr += '<tr>';
                    tr += `<td>${rows[i]['state_abbreviation']}</td>`;
                    tr += `<td>${rows[i]['coal']}</td>`;
                    tr += `<td>${rows[i]['natural_gas']}</td>`;
                    tr += `<td>${rows[i]['nuclear']}</td>`;
                    tr += `<td>${rows[i]['petroleum']}</td>`;
                    tr += `<td>${rows[i]['renewable']}</td>`;
                    tr += `<td>${currentTotal}</td>`;
                    tr += '</tr>';
                }
                template = template.replace('{{DATA}}', tr);
                template = template.replace('{{YEAR_VAR}}', year);
                template = template.replace('{{COAL_VAR}}', coal_count);
                template = template.replace('{{NG_VAR}}', natural_gas_count);
                template = template.replace('{{N_VAR}}', nuclear_count);
                template = template.replace('{{P_VAR}}', petroleum_count);
                template = template.replace('{{R_VAR}}', renewable_count);
                res.status(200).type('html').send(template);
            }
        });
    });
});

// GET request handler for '/state/*'
app.get('/state/:selected_state', (req, res) => {
    let state = req.params.selected_state;
    state = state.toUpperCase();
    fs.readFile(path.join(template_dir, 'state.html'), 'utf-8', (err, template) => {
        db.all("SELECT * from Consumption WHERE state_abbreviation = ?", state, function(err, rows) {
            if (err || rows.length == 0) {
                res.status(404).send(`There is no data for state ${state}`);
            } else {
                template = template.replace('{{STATE}}', state);

                let tr = '';
                let coal_counts = [];
                let natural_gas_counts = [];
                let nuclear_counts = [];
                let petroleum_counts = [];
                let renewable_counts = [];
                for (let i = 0; i < rows.length; i++) {
                    let currentTotal = rows[i]['coal'] + rows[i]['natural_gas'] + rows[i]['nuclear'] + rows[i]['petroleum'] + rows[i]['renewable'];
                    coal_counts.push(rows[i]['coal']);
                    natural_gas_counts.push(rows[i]['natural_gas']);
                    nuclear_counts.push(rows[i]['nuclear']);
                    petroleum_counts.push(rows[i]['petroleum']);
                    renewable_counts.push(rows[i]['renewable']);
    
                    tr += '<tr>';
                    tr += `<td>${rows[i]['year']}</td>`;
                    tr += `<td>${rows[i]['coal']}</td>`;
                    tr += `<td>${rows[i]['natural_gas']}</td>`;
                    tr += `<td>${rows[i]['nuclear']}</td>`;
                    tr += `<td>${rows[i]['petroleum']}</td>`;
                    tr += `<td>${rows[i]['renewable']}</td>`;
                    tr += `<td>${currentTotal}</td>`;
                    tr += '</tr>';
                }
                template = template.replace('{{DATA}}', tr);
                template = template.replace('{{STATE_VAR}}', state);
                template = template.replace('{{COAL_COUNTS}}', `[${coal_counts}]`);
                template = template.replace('{{NG_COUNTS}}', `[${natural_gas_counts}]`);
                template = template.replace('{{N_COUNTS}}', `[${nuclear_counts}]`);
                template = template.replace('{{P_COUNTS}}', `[${petroleum_counts}]`);
                template = template.replace('{{R_COUNTS}}', `[${renewable_counts}]`);
    
                res.status(200).type('html').send(template);
            }
        });
    });
});

// GET request handler for '/energy/*'
app.get('/energy/:selected_energy_source', (req, res) => {
    let source = req.params.selected_energy_source;
    fs.readFile(path.join(template_dir, 'energy.html'), 'utf-8', (err, template) => {
        let queryStatement = `SELECT ${source}, year, state_abbreviation FROM Consumption ORDER by year, state_abbreviation`;
        db.all(queryStatement, function(err, rows) {
            if (err || rows.length == 0) {
                res.status(404).send(`There is no data for type ${source}`);
            } else {
                template = template.replace("{{TYPE}}", source);

                let tr = '';
                let currentTotal = 0;
                let energy_counts = [];
                for (let i = 0; i < rows.length; i++) {
                    currentTotal += rows[i][source];
                    energy_counts.push(rows[i][source]);
                    if (i % 51 == 0 && i > 0) {
                        tr += `<td>${currentTotal}</td>`;
                        tr += '</tr>';
                        currentTotal = 0;
                    }
    
                    if (i % 51 == 0) {
                        tr += '<tr>';
                        tr += `<td>${rows[i]['year']}</td>`;
                        tr += `<td>${rows[i][source]}</td>`;
                    } else if (i < rows.length - 1) {
                        tr += `<td>${rows[i][source]}</td>`;
                    } else {
                        tr += `<td>${rows[i][source]}</td>`;
                        tr += `<td>${currentTotal}</td>`;
                        tr += '</tr>';
                    }   
                }
                template = template.replace('{{DATA}}', tr);
                template = template.replace('{{TYPE_VAR}}', source);
                template = template.replace('{{E_COUNTS}}', `[${energy_counts}]`);
    
                res.status(200).type('html').send(template);
            }
        });
    });
});

app.listen(port, () => {
    console.log('Now listening on port ' + port);
});
