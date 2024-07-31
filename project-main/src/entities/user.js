export class User {
  constructor(
    firstName,
    lastName,
    isAdmin,
    colour,
    password,
    work_ranges = [],
    forgotPassword = false,
    isAdmin = false,
  ) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.isAdmin = isAdmin;
    this.colour = colour;
    this.password = password;
    this.work_ranges = work_ranges;
    this.forgotPassword = forgotPassword;
    this.isAdmin = isAdmin;
  }

  toJSON() {
    return JSON.stringify({ 
      firstName: this.firstName,
      lastName: this.lastName,
      isAdmin: this.isAdmin,
      colour: this.colour,
      work_ranges: this.work_ranges,
      password: this.password,
      forgotPassword: this.forgotPassword,
      isAdmin: this.isAdmin,
    });
  }

  static fromJson(json) {
    return new User(
      json.firstName,
      json.lastName,
      json.isAdmin,
      json.colour,
      json.password,
      json.work_ranges,
      json.forgotPassword,
      json.isAdmin,
    );
  }
}
