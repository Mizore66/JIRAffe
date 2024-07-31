
export class DateTimeUtils{
    
    constructor(){}    

    /** Converts a Date() object into a datetime-local input string */
    static convertDateToDatetimeLocal(date) {
        const year = date.getFullYear();
        const month = `${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    static #timeObjectToTimestamp(timeObject) {
        return new firebase.firestore.Timestamp( timeObject.seconds, timeObject.nanoseconds )
    }

    static convertTimestampToDate(timestamp) {              
        timestamp = this.#timeObjectToTimestamp(timestamp);     // {seconds, nanoseconds} object --> Timestamp object
        return timestamp.toDate();
    }

    static convertTimestampToDatetimeLocal(timestamp) {
        timestamp = this.convertTimestampToDate(timestamp);     // Timestamp --> Date
        return this.convertDateToDatetimeLocal(timestamp);      // Date --> datetime-local
    }

    static convertDatetimeLocalToTimestamp(datetimeLocal) {
        let dateTime = new Date(datetimeLocal);                                 // datetime-local --> Date
        dateTime = firebase.firestore.Timestamp.fromDate(dateTime);             // Date --> Timestamp (i.e. {seconds, nanoseconds} object)
        return {seconds: dateTime.seconds, nanoseconds: dateTime.nanoseconds};  // Timestamp --> {seconds, nanoseconds} object
    }

    /** Get the difference between two times objects */
    static timeDifference(start_time, end_time) {
        const diffSeconds = end_time.seconds - start_time.seconds;
        const diffNanoseconds = end_time.nanoseconds - start_time.nanoseconds;
        return {seconds: diffSeconds, nanoseconds: diffNanoseconds};
    }
    
    /** PRECONDITION: end_time > start_time and both times are {seconds, nanoseconds} objects*/
    static timeDifferenceString(diffTime) {
        let diffSeconds = diffTime.seconds;             // find difference in seconds
        let days = Math.floor(diffSeconds / 86400);     // find the maximum number of whole days in the difference
        diffSeconds -= (days * 86400);                  // subtract the days from the difference
        let hours = Math.floor(diffSeconds / 3600);     // find the maxmimum number of whole hours in the difference
        diffSeconds -= (hours * 3600);                  // subtract the hours from the difference
        let minutes = Math.floor(diffSeconds / 60);     // find the maximum number of whole minutes in the difference
        diffSeconds -= (minutes * 60);                  // subtract the minutes from the difference
        let seconds = diffSeconds;                      // the remainder is the number of seconds
        let day_str = "";
        let hour_str = "";
        let minute_str = "";
        let second_str = "";
        if (days > 0) { day_str = `${days} days `; }
        if (hours > 0) { hour_str = `${hours} hrs `; }
        if (minutes > 0) { minute_str = `${minutes} mins `; }
        if (seconds > 0) { second_str = `${seconds} s`; }
        return `${day_str}${hour_str}${minute_str}${second_str}`;
    }

}
