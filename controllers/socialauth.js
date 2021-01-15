const { google } = require("googleapis");
const fetch = require("node-fetch");

// Get user access token from auth code
exports.getAccessToken = async (authCode) => {
  // Build request body
  const fetchBody = {
    grant_type: "authorization_code",
    client_id: process.env.GOOGLE_WEB_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uri: "",
    code: authCode,
  };

  const tokenData = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    body: JSON.stringify(fetchBody),
    // headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  return tokenData.json();
};

// Fetch user details using user access token
exports.getUserDataFromGoogle = async (googleId, accessToken) => {
  try {
    let res = await google
      .people({
        version: "v1",
        auth: process.env.GOOGLE_SERVER_API_KEY,
      })
      .people.get({
        resourceName: "people/me",
        personFields: "genders,birthdays",
        access_token: accessToken,
      });

    return res;
    // let { birthdays, genders } = res.data;
  } catch (e) {
    console.log(e);
    return null;
  }
};

exports.extractUserDataFromGoogle = (ticketPayload, userData) => {
  var dob = null,
    gender = null;

  // get user date of birth
  if (userData.data.birthdays && userData.data.birthdays[0])
    dob = new Date(
      userData.data.birthdays[0].date.year,
      userData.data.birthdays[0].date.month,
      userData.data.birthdays[0].date.day
    );

  // get user gender
  if (userData.data.genders && userData.data.genders[0])
    gender = userData.data.genders[0].formattedValue;

  userData = {
    dob,
    gender,
    googleId: ticketPayload.sub,
    email: ticketPayload.email,
    emailVerified: ticketPayload.email_verified,
    fullName: ticketPayload.name,
    givenName: ticketPayload.given_name,
    famityName: ticketPayload.family_name,
    locale: ticketPayload.locale,
  };

  return userData;
};
