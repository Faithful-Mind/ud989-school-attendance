var rawModel = {
    _data: JSON.parse(localStorage.udacitySchoolAttendance),

    refreshData() {
        this._data = JSON.parse(localStorage.udacitySchoolAttendance);
    },

    getAllData() {
        return this._data;
    },

    countMissing(studentName, rowIndex=null) {
        if (rowIndex !== null) { // just `if (rowIndex) {` won't work since rowIndex starts form 0
            return this._data[rowIndex].dailyAttendency.reduce((a, b) => a + b);
        }
        for (var i = 0; i < this._data.length; i++) {
            if (this._data[i].name === studentName) {
                return this._data[i].dailyAttendency.reduce((a, b) => a + b);
            }
        }
    },

    changeAttendancy(studentName, isAttendended, nthDay, nthStudent=null) {
        if (nthStudent !== null) {
            this._data[nthStudent].dailyAttendency[nthDay] = isAttendended;
        } else {
            for (var i = 0; i < this._data.length; i++) {
                if (this._data[i].name === studentName) {
                    this._data[i].dailyAttendency[nthDay] = isAttendended;
                }
            }
        }
    }
};

/**
 * Proxy of rawModel for automatically saving and refreshing on invoking.
 */
var model = new Proxy(rawModel, {
    get: function (target, name, receiver) {
        target.refreshData();
        var result = target[name];
        if (localStorage.udacitySchoolAttendance = JSON.stringify(target._data)) {
            // console.warn('successfully saved');
        }
        if(target.hasOwnProperty(name) && typeof result == 'function') {
            // console.warn('invoking method of rawModel');
            return new Proxy(target[name], this);
        }
        // console.warn('property of rawModel invoked');
        return result;
    },

    apply(target, object, args) {
        rawModel.refreshData(); // target is a function
        var result = target.call(object, ...args);
        // console.warn('method of rawModel invoked');
        if (localStorage.udacitySchoolAttendance = JSON.stringify(rawModel._data)) {
            // console.warn('successfully saved');
        }
        return result;
    }
});

var presenter = {

    init() {
        view.init();
    },

    getAllData() {
        return model.getAllData();
    },

    countMissing(studentName, rowIndex=null) {
        return model.countMissing(studentName, rowIndex);
    },

    changeAttendancy(studentName, isAttendended, nthDay, nthStudent=null) {
        model.changeAttendancy(studentName, isAttendended, nthDay, nthStudent);
        view.render();
    }
}

var view = {
    init() {
        this._buildRows();
    },

    _buildRows() {
        var tbody = document.querySelector('table tbody');
        tbody.innerHTML = '';

        presenter.getAllData().forEach((rowData, rowIndex) => {
            tbody.insertAdjacentHTML('beforeend',
                `<tr class="student">
                    <td class="name-col">${rowData.name}</td>
                    <td class="missed-col">${presenter.countMissing(rowData.name, rowIndex)}</td>
                </tr>`
            );
            rowData.dailyAttendency.forEach((isAttended, colIndex) => {
                var chkbox = document.createElement('input');
                chkbox.id = `day-r${rowIndex + 1}-d${colIndex + 1}`;
                chkbox.type = 'checkbox';
                chkbox.checked = isAttended;
                chkbox.addEventListener('change', () => {
                    var isChecked = document.getElementById(`day-r${rowIndex + 1}-d${colIndex + 1}`).checked;
                    // console.warn(isChecked);
                    presenter.changeAttendancy(rowData.name, isChecked, colIndex, rowIndex);
                });

                var td = document.createElement('td');
                td.appendChild(chkbox);

                var tr = tbody.querySelector(`tr:nth-child(${rowIndex + 1})`);
                tr.insertBefore(td, tbody.querySelector(`tr:nth-child(${rowIndex + 1}) td.missed-col`));
            });
        });
    },

    render() {
        presenter.getAllData().forEach((rowData, rowIndex) => {
            var tds = document.querySelectorAll(`body > table > tbody > tr:nth-child(${rowIndex + 1}) > td`);
            var td = tds.item(tds.length - 1);
            td.innerText = presenter.countMissing(rowData.name, rowIndex);
            rowData.dailyAttendency.forEach((isAttended, colIndex) => {
                var chked = document.getElementById(`day-r${rowIndex + 1}-d${colIndex + 1}`).checked = isAttended;
            });
        });
    },
};

presenter.init();
