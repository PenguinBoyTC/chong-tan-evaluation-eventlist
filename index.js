const API = (function () {
  const API_URL = 'http://localhost:3000/events';
  const getEvents = async () => {
    const res = await fetch(API_URL);
    return await res.json();
  };
  const postEvents = async (newEvent) => {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newEvent),
    });
    return await res.json();
  };
  const removeEvent = async (id) => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    });
    return id;
  };

  const updateEvent = async (id, updatedEvent) => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedEvent),
    });
    return await res.json();
  };

  return {
    getEvents,
    postEvents,
    removeEvent,
    updateEvent,
  };
})();

class EventModel {
  #events = [];
  constructor() {
    this.fetchEvents();
  }
  getEvents() {
    return this.#events;
  }
  async fetchEvents() {
    this.#events = await API.getEvents();
    console.log('fetchEvents:', this.#events);
  }

  async addEvent(newEvent) {
    console.log('addEvent:', newEvent);
    const event = await API.postEvents(newEvent);
    this.#events.push(event);
    console.log('addEvent:', this.#events);
    return event;
  }

  async removeEvent(id) {
    await API.removeEvent(id);
    this.#events = this.#events.filter((event) => event.id !== id);
    console.log('removeEvent:', this.#events);
    return id;
  }

  async updateEvent(id, updatedEvent) {
    const newEvent = await API.updateEvent(id, updatedEvent);
    this.#events = this.#events.map((event) =>
      event.id === id ? newEvent : event
    );
    console.log('updateEvent:', this.#events);
    return newEvent;
  }
}

class EventView {
  constructor() {
    this.addBtn = document.querySelector('.event__add-btn');
    this.eventlist = document.querySelector('.event__list');
    this.form = document.querySelector('.event__form');
    this.eventNameInput = document.querySelector('.event__name-input');
    this.startDateInput = document.querySelector('.event__start-date-input');
    this.endDateInput = document.querySelector('.event__end-date-input');
    this.eventContainer = document.querySelector('.event__container');
    this.cancelBtn = document.querySelector('.event__cancel-btn');
  }
  initRenderEvents(events) {
    this.eventlist.innerHTML = '';
    events.forEach((event) => {
      this.appendEvent(event);
    });
  }
  appendEvent(event) {
    const eventItem = this.createEventItem(event);
    this.eventlist.appendChild(eventItem);
  }

  replaceEvent(newEvent, oldId) {
    const newEventItem = this.createEventItem(newEvent);
    const oldEventItem = document.getElementById(`event-${oldId}`);
    this.eventlist.replaceChild(newEventItem, oldEventItem);
  }

  hideForm() {
    console.log('hideForm');
    this.form.classList.remove('show');
    this.form.classList.add('hide');
  }
  displayForm() {
    console.log('displayForm');
    this.form.classList.remove('hide');
    this.form.classList.add('show');
  }
  createEventItem(event) {
    const eventItem = document.createElement('div');
    eventItem.classList.add('event');
    eventItem.classList.add('show');
    eventItem.setAttribute('id', `event-${event.id}`);
    const title = document.createElement('div');
    title.classList.add('event__name');
    title.textContent = event.eventName;
    const startDate = document.createElement('div');
    startDate.classList.add('event__start-date');
    startDate.textContent = event.startDate;
    const endDate = document.createElement('div');
    endDate.classList.add('event__end-date');
    endDate.textContent = event.endDate;
    const buttons = document.createElement('div');
    buttons.classList.add('event__buttons');
    const editBtn = document.createElement('button');
    editBtn.classList.add('event__edit-btn');
    editBtn.setAttribute('edit-id', event.id);
    editBtn.textContent = 'Edit';
    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('event__delete-btn');
    deleteBtn.setAttribute('remove-id', event.id);
    deleteBtn.textContent = 'Delete';
    eventItem.appendChild(title);
    eventItem.appendChild(startDate);
    eventItem.appendChild(endDate);
    buttons.appendChild(editBtn);
    buttons.appendChild(deleteBtn);
    eventItem.appendChild(buttons);
    return eventItem;
  }
  removeEvent(id) {
    const eventItem = document.getElementById(`event-${id}`);
    eventItem.remove();
  }

  editEvent(id, event) {
    const eventItem = document.getElementById(`event-${id}`);
    eventItem.classList.remove('show');
    eventItem.classList.add('hide');
    this.eventNameInput.value = event.eventName;
    this.startDateInput.value = event.startDate;
    this.endDateInput.value = event.endDate;
    this.eventlist.insertBefore(this.form, eventItem);
    this.displayForm();
  }

  setFormAction(action, editId = null) {
    this.form.setAttribute('action', action);
    if (action === 'edit') {
      this.form.setAttribute('edit-id', editId);
    } else {
      console.log('action: add');
      this.form.removeAttribute('edit-id');
      this.eventNameInput.value = '';
      this.startDateInput.value = '';
      this.endDateInput.value = '';
      this.eventContainer.appendChild(this.form);
    }
  }

  showEvent(id) {
    const eventItem = document.getElementById(`event-${id}`);
    eventItem.classList.remove('hide');
    eventItem.classList.add('show');
  }
}

class TodoController {
  constructor(model, view) {
    this.preEditId = null;
    this.model = model;
    this.view = view;
    this.init();
  }
  async init() {
    console.log('init');
    this.setUpEventListeners();
    this.view.hideForm();
    await this.model.fetchEvents();
    this.view.initRenderEvents(this.model.getEvents());
  }

  setUpEventListeners() {
    console.log('setUpEventListeners');
    this.addBtnEventListeners();
    this.handleAddEditformEvent();
    this.handleDeleteEvent();
    this.handleEditEvent();
    this.cancelBtnEventListeners();
  }

  addBtnEventListeners() {
    this.view.addBtn.addEventListener('click', () => {
      console.log('addBtnEventListeners');
      this.view.setFormAction('add');
      this.view.displayForm();
      if (this.preEditId) {
        this.view.showEvent(this.preEditId);
        this.preEditId = null;
      }
    });
  }

  cancelBtnEventListeners() {
    this.view.cancelBtn.addEventListener('click', () => {
      console.log('cancelBtnEventListeners');
      this.view.hideForm();
      if (this.preEditId) {
        this.view.showEvent(this.preEditId);
        this.preEditId = null;
      }
    });
  }

  async handleAddEditformEvent() {
    this.view.form.addEventListener('submit', async (e) => {
      console.log('handleAddEditformEvent');
      e.preventDefault();
      const eventName = this.view.eventNameInput.value;
      const startDate = this.view.startDateInput.value;
      const endDate = this.view.endDateInput.value;
      if (!eventName || !startDate || !endDate) {
        alert('Please fill in all fields');
        return;
      }
      if (new Date(startDate) > new Date(endDate)) {
        alert('Start date must be before end date');
        return;
      }
      const formAction = this.view.form.getAttribute('action');
      if (formAction === 'edit') {
        const editId = this.view.form.getAttribute('edit-id');
        const updatedEvent = { eventName, startDate, endDate };
        this.model.updateEvent(editId, updatedEvent).then((event) => {
          this.view.replaceEvent(event, editId);
          this.view.hideForm();
          this.preEditId = null;
        });
      } else {
        this.model.addEvent({ eventName, startDate, endDate }).then((event) => {
          this.view.appendEvent(event);
          this.view.hideForm();
        });
      }
    });
  }
  async handleDeleteEvent() {
    this.view.eventlist.addEventListener('click', (e) => {
      console.log('handleDeleteEvent');
      const isDeleteBtn = e.target.classList.contains('event__delete-btn');
      if (isDeleteBtn) {
        const removeId = e.target.getAttribute('remove-id');
        this.model.removeEvent(removeId).then((id) => {
          this.view.removeEvent(removeId);
          this.view.hideForm();
          if (this.preEditId) {
            this.view.showEvent(this.preEditId);
            this.preEditId = null;
          }
        });
      }
    });
  }
  async handleEditEvent() {
    console.log('handleEditEvent');
    this.view.eventlist.addEventListener('click', (e) => {
      const isEditBtn = e.target.classList.contains('event__edit-btn');
      if (isEditBtn) {
        const editId = e.target.getAttribute('edit-id');
        const event = this.model
          .getEvents()
          .find((event) => Number(event.id) === Number(editId));
        this.view.setFormAction('edit', editId);
        this.view.editEvent(editId, event);
        if (this.preEditId) {
          this.view.showEvent(this.preEditId);
        }
        this.preEditId = editId;
      }
    });
  }
}

const model = new EventModel();
const view = new EventView();
const controller = new TodoController(model, view);
