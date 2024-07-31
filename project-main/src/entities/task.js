export class Task {

  id= "";

  constructor(
    assignee,
    bug,
    description,
    name,
    stage,
    tag,
    urgency,
    story_points,
    start_time,
    end_time,
    total_time
  ) {
    this.assignee = assignee;
    this.bug = bug;
    this.description = description;
    this.name = name;
    this.stage = stage;
    this.tag = tag;
    this.urgency = urgency;
    this.story_points = story_points;
    this.start_time = start_time;
    this.end_time = end_time;
    this.total_time = total_time;
  }

  toJSON() {
    return JSON.stringify({
      "assignee":  this.assignee,
      "bug": this.bug,
      "description": this.description,
      "name": this.name,
      "stage": this.stage,
      "tag": this.tag,
      "urgency": this.urgency,
      "story_points": this.story_points,
      "start_time": this.start_time,
      "end_time": this.end_time,
      "total_time": this.total_time
    });
  }

  static fromJson(jsonTask) {
    return new Task(
      jsonTask.assignee,
      jsonTask.bug,
      jsonTask.description,
      jsonTask.name,
      jsonTask.stage,
      jsonTask.tag,
      jsonTask.urgency,
      jsonTask.story_points,
      jsonTask.start_time,
      jsonTask.end_time,
      jsonTask.total_time
    );

  }

}

