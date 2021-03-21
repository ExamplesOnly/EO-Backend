module.exports = `
  extend type Query {
    User(uuid: String): User
  }

  type User {
    uuid: String!
    userId: String
    email: String!
    firstName: String!
    middleName: String
    lastName: String
    bio: String
    dob: String
    gender: String
    phoneNumber: String
    countryCode: String
    profileImage: String
    coverImage: String
    emailVerified: Boolean!
    blocked: Boolean
    videos(limit: Int, offset: Int): [Video!]
  }

  input UserInput {
    userId: String!
    email: String!
    firstName: String!
    middleName: String
    lastName: String
    password: String
  }
`;