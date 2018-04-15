/**
 * PlannerEngine singleton class for the planner tool.
 * 
 * @author Christopher Boler <christopher.boler@gmail.com>
 * 
 * @param {Object} w - Window DOM object
 * @param {Object} d - Document DOM object
 * 
 * @returns {Object} PlannerEngine - The calendar engine for the planner
 */
PlannerEngine = (function(w, d) {
  //Declarations
  this.month = d.querySelectorAll('[data-calendar-area="month"]')[0];
  this.next = d.querySelectorAll('[data-calendar-toggle="next"]')[0];
  this.previous = d.querySelectorAll('[data-calendar-toggle="previous"]')[0];
  this.label = d.querySelectorAll('[data-calendar-label="month"]')[0];
  this.modes = d.querySelectorAll('input[name="MODE"]');
  this.MODE = d.querySelector('input[name="MODE"]:checked').value;
  this.activeDates = null;
  this.date = new Date();
  this.todaysDate = new Date();
  this.activity = null;

  //Methods

  /**
   * Initialization method
   * 
   * @param {Object} options - currently the only option is to disable days prior to the current tate { disablePastDays : boolean }
   */
  this.init = function(options) {
    this.options = options;
    this.date.setDate(1);
    this.createMonth();
    this.createListeners();
  };

  /**
   * Creates handler events for DOM elements
   */
  createListeners = function() {
    var self = this;
    this.closeModal();
    // Clears the calendar and shows the next month, week, or day
    this.next.addEventListener("click", function() {
      self.clearCalendar();
      var weekLegend = d.querySelector('.cal-week');
      switch(MODE){
        case "1":
          weekLegend.style.visibility = "visible";
          var nextMonth = self.date.getMonth() + 1;
          self.date.setMonth(nextMonth);
          self.createMonth();
          break;
        case "2":
          weekLegend.style.visibility = "visible";
          var nextWeek = self.date.getDate() + 7;
          self.date.setDate(nextWeek);
          self.createWeek();
          break;
        case "3":
          self.label.innerHTML = self.dayAsString(self.date.getDay()) +  ", " + self.monthsAsString(self.date.getMonth()) + " " + self.date.getDate() + " " + self.date.getFullYear();
          weekLegend.style.visibility = "hidden";
          var tomorrow = self.date.getDate() + 1;
          self.date.setDate(tomorrow);
          self.createDay(
            self.date.getDate(),
            self.date.getDay(),
            self.date.getFullYear()
          );
          break;
      }
    });

    // Clears the calendar and shows the previous month, week, or day
    this.previous.addEventListener("click", function() {
      self.clearCalendar();
      var weekLegend = d.querySelector('.cal-week');
      switch(MODE){
        case "1":
          weekLegend.style.visibility = "visible";
          var prevMonth = self.date.getMonth() - 1;
          self.date.setMonth(prevMonth);
          self.createMonth();
          break;
        case "2":
          weekLegend.style.visibility = "visible";
          var prevWeek = self.date.getDate() - 7;
          self.date.setDate(prevWeek);
          self.createWeek();
          break;
        case "3":
          self.label.innerHTML = self.dayAsString(self.date.getDay()) +  ", " + self.monthsAsString(self.date.getMonth()) + " " + self.date.getDate() + " " + self.date.getFullYear();
          weekLegend.style.visibility = "hidden";
          var yesterday = self.date.getDate() - 1;
          self.date.setDate(yesterday);
          self.createDay(
            self.date.getDate(),
            self.date.getDay(),
            self.date.getFullYear()
          );
          break;
      }
    });

    // Adds handlers to each radio button
    for(var i = 0; i < modes.length; i++){
      // clears the calendar and displays the current month, week, or day
      modes[i].addEventListener("change", function() {
        // Update the MODE
        for(var j = 0; j < modes.length; j++){
          if(modes[j].checked){
            MODE = modes[j].value;
            break;
          }
        }
        self.clearCalendar();
        var weekLegend = d.querySelector('.cal-week');
        switch(MODE){
          case "1":
            weekLegend.style.visibility = "visible";
            self.createMonth();
            break;
          case "2":
            weekLegend.style.visibility = "visible";
            self.createWeek();
            break;
          case "3":
            self.label.innerHTML = self.dayAsString(self.date.getDay()) +  ", " + self.monthsAsString(self.date.getMonth()) + " " + self.date.getDate() + " " + self.date.getFullYear();
            var weekLegend = d.querySelector('.cal-week');
            weekLegend.style.visibility = "hidden";
            self.createDay(
              self.date.getDate(),
              self.date.getDay(),
              self.date.getFullYear()
            );
            break;
        }
      });
    }
  };

  /**
   * Creates a DOM object representing the day
   * 
   * @param {number} num - the date
   * @param {number} day - the day
   * @param {number} year - the full year
   */
  createDay = function(num, day, year) {
    var newDay = d.createElement("div");
    var dateEl = d.createElement("span");
    dateEl.innerHTML = num;
    newDay.className = "cal-date";
    newDay.setAttribute("data-calendar-date", this.date);

    // if it's the first day of the month
    if (num === 1) {
      if (day === 0) {
        newDay.style.marginLeft = 6 * 14.28 + "%";
      } else {
        newDay.style.marginLeft = (day - 1) * 14.28 + "%";
      }
    }

    if (this.options.disablePastDays && this.date.getTime() <= this.todaysDate.getTime() - 1) {
      newDay.classList.add("cal-date--disabled");
    } else {
      newDay.classList.add("cal-date--active");
      newDay.setAttribute("data-calendar-status", "active");
    }

    if (this.date.toString() === this.todaysDate.toString()) {
      newDay.classList.add("cal-date--today");
    }

    if(day === 0 || day === 6){
      newDay.classList.add("cal-date--weekend");
    }

    newDay.appendChild(dateEl);
    this.month.appendChild(newDay);
  };

  /**
   * Add handlers to each active date.
   */
  dateClicked = function() {
    var self = this;
    this.activeDates = d.querySelectorAll('[data-calendar-status="active"]');
    for (var i = 0; i < this.activeDates.length; i++) {
      this.activeDates[i].addEventListener("click", function(event) {
        self.removeActiveClass();
        this.classList.add("cal-date--selected");

        var modalWindow = d.querySelector("#activityModal");
        // not a true array, is a DomTokenList
        modalWindow.classList.contains('open') ? modalWindow.classList.remove('open') : modalWindow.className += ' ' + 'open'; 
      });
    }
  };

  /**
   * Iterates over a month and creates day objects in the DOM.
   */
  createMonth = function() {
    var self = this;
    var currentMonth = this.date.getMonth();
    while (self.date.getMonth() === currentMonth) {
      this.createDay(
        this.date.getDate(),
        this.date.getDay(),
        this.date.getFullYear()
      );
      this.date.setDate(this.date.getDate() + 1);
    }
    // while loop trips over and day is at 30/31, bring it back
    this.date.setDate(1);
    this.date.setMonth(this.date.getMonth() - 1);

    this.label.innerHTML = this.monthsAsString(this.date.getMonth()) + " " + this.date.getFullYear();
    this.dateClicked();
  };

  /**
   * Iterates over a week and adds day objects to the DOM
   */
  createWeek = function() {
    var self = this;
    var diff = this.todaysDate.getDate() - this.todaysDate.getDay() + (this.todaysDate.getDay() === 0 ? -6 : 1);
    this.date.setDate(diff);
    for(var i = 0; i <= 6; i++){
      this.createDay(
        this.date.getDate(),
        this.date.getDay(),
        this.date.getFullYear()
      );
      this.date.setDate(this.date.getDate() + 1);
    }
    // Get the week number
    var janFirst = new Date(this.date.getFullYear(),0,1);
    var millisecsInDay = 86400000;
    var weekNumber = Math.ceil((((this.date - janFirst) /millisecsInDay) + janFirst.getDay()+1)/7);
    this.label.innerHTML = "Week " + weekNumber +  " of " + this.date.getFullYear();
    this.dateClicked();
  };

  /**
   * Converts numeric month to a string value.
   * 
   * @param {number} monthIndex - index passed
   * 
   * @returns {string} month string representation
   */
  monthsAsString = function(monthIndex) {
    return [
      "January",
      "Febuary",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ][monthIndex];
  };

  /**
   * Converts numeric day to a string value.
   * 
   * @param {number} dayIndex - index passed
   * 
   * @returns {string} day string representation
   */
  dayAsString = function(dayIndex) {
    return [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday"
    ][dayIndex];
  }

  /**
   * Adds handlers to close the modal
   */
  closeModal = function (){
    var closeButton = d.querySelector('#modalClose');
    var closeOverlay = d.querySelector('#overlay');

    closeButton.addEventListener("click", function() {
      var modalWindow = d.querySelector("#activityModal");
      modalWindow.classList ? modalWindow.classList.remove('open') : modalWindow.className = modalWindow.className.replace(new RegExp('(^|\\b)' + 'open'.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
    });

    closeOverlay.addEventListener("click", function() {
      var modalWindow = d.querySelector("#activityModal");
      modalWindow.classList ? modalWindow.classList.remove('open') : modalWindow.className = modalWindow.className.replace(new RegExp('(^|\\b)' + 'open'.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
    });
};

  /**
   * Clears the calendar
   */
  clearCalendar = function() {
    this.month.innerHTML = "";
  };

  /**
   * Removes the activated class from a day object
   */
  removeActiveClass = function() {
    for (var i = 0; i < this.activeDates.length; i++) {
      this.activeDates[i].classList.remove("cal-date--selected");
    }
  };

  return this;
})(window, document);
