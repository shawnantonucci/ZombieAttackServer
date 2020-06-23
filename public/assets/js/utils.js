const postData = (url = "", data = {}) => {
  return fetch(url, {
    method: "POST",
    mode: "cors",
    cache: "no-cache",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    redirect: "follow",
    referrer: "no-referer",
    body: JSON.stringify(data),
  }).then((response) => response.json());
};

const signIn = () => {
  const body = {
    email: document.forms[0].elements[0].value,
    password: document.forms[0].elements[1].value,
  };

  postData("/login", body)
    .then((response) => {
      if (response.status !== 200) throw new Error(response.error);
      window.location.replace("/game.html");
    })
    .catch((error) => {
      window.alert(error.message);
      window.location.replace("/index.html");
    });
};

const signUp = () => {
  const body = {
    email: document.forms[0].elements[0].value,
    password: document.forms[0].elements[1].value,
    username: document.forms[0].elements[2].value,
  };

  postData("/signup", body)
    .then((response) => {
      if (response.status !== 200) throw new Error(response.error);
      window.alert("user created");
      window.location.replace("/index.html");
    })
    .catch((error) => {
      window.alert(error.message);
      window.location.replace("/signup.html");
    });
};

const forgotPassword = () => {
  const body = {
    email: document.forms[0].elements[0].value,
  };

  postData("/forgot-password", body)
    .then((response) => {
      if (response.status !== 200) throw new Error(response.error);
      window.alert("password reset email sent");
      window.location.replace("/index.html");
    })
    .catch((error) => {
      window.alert(error.message);
      window.location.replace("/forgot-password.html");
    });
};

const resetPassword = () => {
  const password = document.forms[0].elements[1].value;
  const verifiedPassword = document.forms[0].elements[2].value;

  const body = {
    password,
    verifiedPassword,
    email: document.forms[0].elements[0].value,
    token: document.location.href.split("token=")[1],
  };

  if (password !== verifiedPassword) {
    window.alert("passwords do not match");
  } else {
    postData("/reset-password", body)
      .then((response) => {
        if (response.status !== 200) throw new Error(response.error);
        window.alert("password updated");
        window.location.replace("/index.html");
      })
      .catch((error) => {
        window.alert(error.message);
        window.location.replace("/reset-password.html");
      });
  }
};
