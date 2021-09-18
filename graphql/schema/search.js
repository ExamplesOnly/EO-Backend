module.exports = `
  extend type Query {
    ${/* 
    Search(query: String): SearchAll! */ ""}
    SearchUser(query: String, limit: Int, offset: Int): SearchUser!
    SearchVideo(query: String, limit: Int, offset: Int): SearchVideo!
  }

  type SearchAll {
    query: String!
    queryTimeStamp: String!
    users(limit: Int, offset: Int): [User!]!
    videos(limit: Int, offset: Int): [Video!]!
  }

  type SearchUser {
    query: String!
    queryTimeStamp: String!
    users: [User!]!
  }

  type SearchVideo {
    query: String!
    queryTimeStamp: String!
    videos: [Video!]!
  }
`;
