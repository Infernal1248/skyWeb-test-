(() => {
    /**
     * N - Node, префикс для переменных, содержащих узлы DOM
     * L - Label, префикс для переменных, содержащих строковые переменные
     */
    const N_CALENDAR = document.querySelector('.js-calendar-async-book');
    const N_BOOK_ACTION = document.querySelector('.js-book');
    const N_LOADING_ANIMATION = document.querySelector('.js-loading');
    const N_SERVER_STATUS_LINE = document.querySelector('.js-status');
    const N_ACTIVE = document.querySelector('.js-booking');
    const N_ALL_BTNS_DAY = N_CALENDAR.querySelectorAll('.calendar-day-action');
    const L_MONTHS = ["Янв", "Февраля", "Марта", "Апреля", "Мая", "Июня",
        "Июля", "Августа", "Сентября", "Октября", "Ноября", "Декабря"];
    const L_DAY_BOOKED = 'День забронирован';
    const L_DAY_not_BOOKED = 'День свободен';
    const L_DAY_NOT_BOOKED_AND_SELECTED = 'День свободен и выбран';
    const L_SERVER_STATUSES = {
        SUCCESS: {
            label: 'Бронирование успешно завершено',
            color: '#2DCC70',
        },
        ERROR: {
            label: 'Произошла ошибка, попробуйте вновь',
            color: '#E84C3D',
        },
    };
    const DAY_SELECTOR = 'calendar-day';
    const HIDDEN_CLASS = 'invisible';
    const BOOKED_MODIFIER = 'booked';
    const SELECTED_MODIFIER = 'selected';
    const DEFAULT_ANIMATION_DURATION = '60s';
    /**
     *  Через сколько секунд прячется кнопка "забронировать"
     * @type {number}
     */
    const DEFAULT_ACTION_HIDE_TIMEOUT = 500;
    let selectedDays = [];

    function addBookedDays(days) {
        days.forEach((bookedDay) => {
            const n_date = N_CALENDAR.querySelector(`td[data-date="${bookedDay}"]`);
            const dateObject = new Date(bookedDay);
            const dayLabel = dateObject.getUTCDate() + ' ' + L_MONTHS[dateObject.getMonth()];
            n_date.classList.add(`${DAY_SELECTOR}_${BOOKED_MODIFIER}`);
            n_date.setAttribute('title', `${dayLabel} - ${L_DAY_BOOKED}`);
            n_date.classList.remove(`${DAY_SELECTOR}_${SELECTED_MODIFIER}`);
            n_date.querySelector('button').disabled = true;
        });
    }

    function removerFromArray(array, el) {
        const index = array.indexOf(el);
        if (index > -1) {
            array.splice(index, 1);
        }
        return array;
    }

    function saveSelectedDays() {
        const n_parent = this.parentNode;
        const selectedDate = n_parent.dataset.date;
        const dateObject = new Date(selectedDate);
        const dayLabel = dateObject.getUTCDate() + ' ' + L_MONTHS[dateObject.getMonth()];
        if (n_parent.classList.contains(`${DAY_SELECTOR}_${SELECTED_MODIFIER}`)) {
            removerFromArray(selectedDays, selectedDate);
            n_parent.classList.remove(`${DAY_SELECTOR}_${SELECTED_MODIFIER}`);
            n_parent.setAttribute('title', `${dayLabel} - ${L_DAY_not_BOOKED}`);
        } else {
            selectedDays.push(selectedDate);
            n_parent.classList.add(`${DAY_SELECTOR}_${SELECTED_MODIFIER}`);
            n_parent.setAttribute('title', `${dayLabel} - ${L_DAY_NOT_BOOKED_AND_SELECTED}`);
        }
        if (selectedDays.length === 0) {
            N_BOOK_ACTION.classList.add(HIDDEN_CLASS);
            N_BOOK_ACTION.disabled = true;
        } else {
            N_BOOK_ACTION.classList.remove(HIDDEN_CLASS);
            N_BOOK_ACTION.disabled = false;
        }
    }

    function showResult(type) {
        N_LOADING_ANIMATION.style['animation-duration'] = '0s';
        N_LOADING_ANIMATION.style['background-color'] = L_SERVER_STATUSES[type].color;
        if (!L_SERVER_STATUSES.hasOwnProperty(type)) {
            throw new Error('Illegal argument');
        }
        N_SERVER_STATUS_LINE.classList.remove(HIDDEN_CLASS);
        N_SERVER_STATUS_LINE.innerText = L_SERVER_STATUSES[type].label;
        N_SERVER_STATUS_LINE.style.color = L_SERVER_STATUSES[type].color;
        setTimeout(() => {
            N_BOOK_ACTION.classList.add(HIDDEN_CLASS);
            N_SERVER_STATUS_LINE.classList.add(HIDDEN_CLASS);
        }, DEFAULT_ACTION_HIDE_TIMEOUT);
    }

    function book() {
        N_BOOK_ACTION.disabled = true;
        N_LOADING_ANIMATION.style['animation-duration'] = DEFAULT_ANIMATION_DURATION;
        const formData = new FormData();
        formData.append('selectedDays', JSON.stringify(selectedDays));
        fetch(`post.php`, {
            method: 'post',
            body: formData,
        }).then(response => response.json())
            .then(() => {
                showResult('SUCCESS');
                addBookedDays(selectedDays);
                N_BOOK_ACTION.disabled = false;
            }).catch(() => {
            showResult('ERROR');
            N_BOOK_ACTION.disabled = false;
        });
    }

    function catchButtons() {
        N_ALL_BTNS_DAY.forEach((n_btn) => {
            n_btn.addEventListener('click', saveSelectedDays);
        });
        N_BOOK_ACTION.addEventListener('click', book);
    }

    function initialize() {
        catchButtons();
        fetch(`api.php`).then((response) => {
            if (!response.ok) {
                throw response;
            }
            return response.json();
        })
            .then((data) => {
                addBookedDays(data);
                N_ACTIVE.style['z-index'] = 1;
                N_ACTIVE.style.opacity = 1;
                N_LOADING_ANIMATION.style['animation-duration'] = '0s';
            })
            .catch(() => {
                showResult('ERROR');
            });
    }

    window.onload = () => {
        document.body.classList.remove('no-js');
        initialize();
    };
})();
