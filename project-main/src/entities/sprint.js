
export class Sprint{
    // properties of a sprint: project ID, list of task ID's in the sprint for each column, sprint name, sprint ID

    constructor(projectID, sprint_name, start_date, end_date , tasks, tasks_notStarted, tasks_inProgress, tasks_completed) {
        this.projectID = projectID;
        this.sprint_name = sprint_name;
        this.tasks_notStarted = tasks_notStarted;
        this.tasks_inProgress = tasks_inProgress;
        this.tasks_completed =  tasks_completed;
        this.start_date = start_date;
        this.end_date = end_date;
        this.tasks = tasks;
    }

    toJSON() {
        return JSON.stringify({
            projectID: this.projectID,
            sprint_name: this.sprint_name,
            tasks_notStarted: this.tasks_notStarted,
            tasks_inProgress: this.tasks_inProgress,
            tasks_completed:  this.tasks_completed,
            start_date: this.start_date,
            end_date: this.end_date,
            tasks: this.tasks,
        });
    }

    static fromJSON(jsonObject) {
        return new Sprint(
            jsonObject.projectID,
            jsonObject.sprint_name,
            jsonObject.start_date,
            jsonObject.end_date,
            jsonObject.tasks,
            jsonObject.tasks_notStarted,
            jsonObject.tasks_inProgress,
            jsonObject.tasks_completed,
        );
    }



}