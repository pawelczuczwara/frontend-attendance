'use strict'

const model = {
    days: 12,
    students: [ 'student1', 'studen2', 'studen3', 'studen4', 'student5',  'Ikna' ],
    get_data: function get_data() {
        return JSON.parse(localStorage.student_atend);
    },
    set_data: function set_data(new_data) {
        localStorage.student_atend = JSON.stringify(new_data);
    },
    check_data: function chcek_data() {
        return (localStorage.student_atend);
    }
};

class CreateContent
{
    constructor(data, template, entry) {
        this.data           = data;
        this.template_class = template;
        this.entry_node     = document.querySelector(entry);
    }

    _getTemplate() {
        const html = document.querySelector(this.template_class).innerHTML;
        const compiled_html = Handlebars.compile(html);
        return compiled_html;
    }

    _insertHTML(html) {
        this.entry_node.insertAdjacentHTML('beforeend', html);
    }

    create_HTML() {
        let compiled_html       = '';
        const compiled_template = this._getTemplate();

        if (this._isIterable(this.data)) {
            for (let content of this.data) {
                compiled_html = compiled_html + compiled_template(content);
            }
        } else {
            compiled_html = compiled_template(this.data);
        }
        this._insertHTML(compiled_html);
    }

    _isIterable(obj) {
        // checks for null and undefined
        if (obj == null) {
          return false;
        }
        //check if is iterable
        return typeof obj[Symbol.iterator] === 'function';
    }
};

const main = {
    init: function init() {
        this._init_localstorage();

        view_table.init();
        view_table.set_listener();
    },

    _init_localstorage: function init_localstorage() {
        if (!model.check_data()) {
            console.log('Creating attendance records...');
            function getRandom() {
                return (Math.random() >= 0.5);
            }

            let attendance = [];
            for (let name of model.students) {
                let array = [];
                let sumarry = 0;

                for (var i = 0; i <= (model.days - 1); i++) {
                    let a = getRandom();
                    (a === false) ? sumarry = sumarry + 1 : '';
                    array.push(a);
                }

                let object = {
                    name: name,
                    attend: array,
                    missed: sumarry
                };
                attendance.push(object);
            }
            // localStorage.student_atend = JSON.stringify(attendance);
            model.set_data(attendance);
        }
    },

    get_data: function() {
        return model.get_data();
    },

    set_data: function(data) {
        model.set_data(data);
    },

    update_data: function(student, array, sum) {
        let data = this.get_data();
        let data_object = {
            name: student,
            attend: array,
            missed: sum
        }

        //replace current student data in data array
        for (var i = 0; i <= (data.length - 1); i++) {
            if (data[i].name === student) {
                data[i] = data_object;
            }
        }
        model.set_data(data);
    },
};

const view_table = {
    init: function() {
        this.attend = main.get_data();

        const content = new CreateContent(this.attend, '.atend_template', '.dane');
        content.create_HTML();
    },

    set_listener: function set_listener() {
        // When a checkbox is clicked, update localStorage
        window.addEventListener('change', function(e) {
            (e.target.type === 'checkbox') ? view_table._set_missing(e.target) : '';
        })
    },

    // set value of missing column
    _set_missing: function(target) {
        let missed_col = target.parentNode.parentNode.parentNode.querySelector('.missed-col');
        let data_key = target.parentNode.parentNode.parentNode.dataset.key;

        if (target.checked) {
            missed_col.textContent =  parseInt(missed_col.textContent) - 1;
        } else {
            missed_col.textContent =  parseInt(missed_col.textContent) + 1;
        }
        this._row_data(data_key);
    },

    // get nodes for calculating new object of complete row data.
    _row_data: function(student) {
        const row_node = document.querySelector(`[data-key='${student}']`);
        const row_input_nodes = row_node.querySelectorAll('input');
        const sum = row_node.querySelector('.missed-col').innerHTML;

        let array = [];
        for (let chbox of row_input_nodes) {
            array.push(chbox.checked);
        }
        main.update_data(student, array, sum);
    },
};

main.init();


