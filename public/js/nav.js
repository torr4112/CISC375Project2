const states = ['AK', 'AL', 'AR', 'AZ', 'CA', 'CO', 'CT', 'DC', 'DE', 'FL', 'GA', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY',
    'LA', 'MA', 'MD', 'ME', 'MI', 'MN', 'MO', 'MS', 'MT', 'NC', 'ND', 'NE', 'NH', 'NJ', 'NM', 'NV', 'NY', 'OH', 'OK', 'OR', 'PA',
    'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VA', 'VT', 'WA', 'WI', 'WV', 'WY'];


let statesDropdown = document.getElementById('states');
let yearsDropdown = document.getElementById('years');
let energyDropdown = document.getElementById('energy');

for (let i = 0; i < states.length; i++) {
    let stateItem = document.createElement("li");
    let anchorItem = document.createElement("a");
    anchorItem.href = '/state/' + states[i];
    anchorItem.textContent = states[i];
    stateItem.appendChild(anchorItem);
    statesDropdown.appendChild(stateItem);
}

for (let i = 0; i < 59; i++) {
    let yearItem = document.createElement("li");
    let anchorItem = document.createElement("a");
    anchorItem.href = `/year/${i + 1960}`;
    anchorItem.textContent = `${i + 1960}`;
    yearItem.appendChild(anchorItem);
    yearsDropdown.appendChild(yearItem);
}

let sourceItem = document.createElement("li");
let anchorItem = document.createElement("a");
anchorItem.href = '/energy/coal';
anchorItem.textContent = 'Coal';
sourceItem.appendChild(anchorItem);
energyDropdown.appendChild(sourceItem);

sourceItem = document.createElement("li");
anchorItem = document.createElement("a");
anchorItem.href = '/energy/natural_gas';
anchorItem.textContent = 'Natural Gas';
sourceItem.appendChild(anchorItem);
energyDropdown.appendChild(sourceItem);

sourceItem = document.createElement("li");
anchorItem = document.createElement("a");
anchorItem.href = '/energy/nuclear';
anchorItem.textContent = 'Nuclear';
sourceItem.appendChild(anchorItem);
energyDropdown.appendChild(sourceItem);

sourceItem = document.createElement("li");
anchorItem = document.createElement("a");
anchorItem.href = '/energy/petroleum';
anchorItem.textContent = 'Petroleum';
sourceItem.appendChild(anchorItem);
energyDropdown.appendChild(sourceItem);

sourceItem = document.createElement("li");
anchorItem = document.createElement("a");
anchorItem.href = '/energy/renewable';
anchorItem.textContent = 'Renewable';
sourceItem.appendChild(anchorItem);
energyDropdown.appendChild(sourceItem);


let previous = document.getElementById("previous");
let next = document.getElementById("next");

let sources = ["coal", "natural_gas", "nuclear", "petroleum", "renewable"];
let url = document.URL;
let parts = url.split("/")
if (url.indexOf("state") > 0) {
    let currentState = parts[parts.length - 1];
    let currentStateIdx = states.indexOf(currentState);
    let nextState;
    let previousState;
    if (currentStateIdx == 0) {
        previousState = states[states.length - 1];
    } else {
        previousState = states[(currentStateIdx - 1) % states.length];
    }
    
    nextState = states[(currentStateIdx + 1) % states.length];
    next.href = '/state/' + nextState;
    previous.href = '/state/' + previousState;
} else if (url.indexOf("year") > 0) {
    let currentYear = parts[parts.length - 1] - 1960;
    let nextYear = (currentYear + 1) + 1960;
    let previousYear = (currentYear - 1) + 1960;
    if (nextYear > 2018) {
        nextYear = 1960;
    } else if (previousYear < 1960) {
        previousYear = 2018;
    }

    next.href = '/year/' + nextYear;
    previous.href = '/year/' + previousYear;
} else {
    let currentSource = parts[parts.length - 1];
    let currentSourceIdx = sources.indexOf(currentSource);
    let nextSource = sources[(currentSourceIdx + 1) % sources.length];
    let previousSource;
    if (currentSourceIdx == 0) {
        previousSource = sources[sources.length - 1];
    } else {
        previousSource = sources[(currentSourceIdx - 1) % sources.length];
    }

    next.href = '/energy/' + nextSource;
    previous.href = '/energy/' + previousSource;
}
